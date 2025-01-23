use crate::schedule::{
  constants::week_days,
  day_ref::{DayRef, DayRefArray},
  duty::ExtraDuty,
  duty_ref::{DutyRef, RefIterable, RefIterator},
  ref_traits::{RefArrayLike, RefArrayRandomize, RefArrayRemoveWhere},
  schedule_table::ExtraScheduleTable,
  worker::Worker,
  worker_ref::{WorkerRef, WorkerRefArray},
};

pub struct AssignInfo<'a> {
  pub table: &'a ExtraScheduleTable,
  pub assign_size: u8,
  pub day_ref: DayRef,
  pub duty_ref: DutyRef,
  pub duty: &'a ExtraDuty,
  pub worker_ref: WorkerRef,
  pub worker: &'a Worker,
}

type AssignRuleCheckFn = fn(info: &AssignInfo) -> bool;

pub struct PreAssignDutyInfo<'a> {
  pub table: &'a ExtraScheduleTable,
  pub duty_ref: DutyRef,
  pub duty: &'a ExtraDuty,
}

type PreAssignDutyCheckFn = fn(info: PreAssignDutyInfo) -> bool;

pub struct PreAssignDayInfo<'a> {
  pub table: &'a ExtraScheduleTable,
  pub day_ref: DayRef,
}

type PreAssignDayCheckFn = fn(info: PreAssignDayInfo) -> bool;

pub struct PreAssignInfo<'a> {
  pub table: &'a ExtraScheduleTable,
  pub worker_ref: WorkerRef,
  pub worker: &'a Worker,
}

type PreAssignInfoCheckFn = fn(info: PreAssignInfo) -> bool;

#[derive(Clone, Copy)]
pub struct AssignStep {
  pub only_worker_where: PreAssignInfoCheckFn,
  pub pass_day_when: PreAssignDayCheckFn,
  pub pass_duty_when: PreAssignDutyCheckFn,
  pub in_pairs: bool,
  pub full_day: bool,
  pub min: u8,
  pub max: u8,
  pub duty_min_distance: u8,
}

impl Default for AssignStep {
  fn default() -> Self {
    AssignStep {
      only_worker_where: |_| true,
      pass_day_when: |_| false,
      pass_duty_when: |_| false,
      duty_min_distance: 2,
      min: 1,
      max: 2,
      full_day: false,
      in_pairs: true,
    }
  }
}

#[derive(Clone)]
pub struct ScheduleAssigner {
  pub step: AssignStep,
  pub assign_rules: Vec<AssignRuleCheckFn>,
  current_duty_limit: u8,
}

impl ScheduleAssigner {
  pub fn new() -> Self {
    ScheduleAssigner {
      step: AssignStep::default(),
      assign_rules: Vec::new(),
      current_duty_limit: 1,
    }
  }

  pub fn set_step(&mut self, step: &AssignStep) {
    self.step = *step;
  }

  pub fn add_rule(&mut self, rule: AssignRuleCheckFn) -> &mut Self {
    self.assign_rules.push(rule);

    self
  }

  pub fn assign(&mut self, table: &mut ExtraScheduleTable) {
    let mut worker_refs = table.get_worker_ref_array();

    let is_worker_allowed = self.step.only_worker_where;

    worker_refs.remove_where(|worker_ref| {
      let worker = table.get_worker(worker_ref);

      !is_worker_allowed(PreAssignInfo {
        table,
        worker,
        worker_ref,
      })
    });

    let mut day_refs = table.get_day_ref_array();

    let start_duty_limit = self.current_duty_limit;

    for limit in self.step.min..=self.step.max {
      self.current_duty_limit = limit;

      day_refs.randomize();

      self.assign_in_days(table, &day_refs, &mut worker_refs);
    }

    self.current_duty_limit = start_duty_limit;
  }

  pub fn assign_in_days(
    &mut self,
    table: &mut ExtraScheduleTable,
    day_refs: &DayRefArray,
    worker_refs: &mut WorkerRefArray,
  ) {
    for day_ref in day_refs.iter() {
      worker_refs.remove_where(|worker_ref| table.is_worker_reached_limit(worker_ref));
      if worker_refs.gen_len() == 0 {
        break;
      }

      let should_pass_day = self.step.pass_day_when;

      if should_pass_day(PreAssignDayInfo { day_ref, table }) {
        continue;
      }

      if self.step.full_day {
        self.assign_full_day(table, day_ref, worker_refs);
        continue;
      }

      if self.step.in_pairs {
        self.assign_in_pairs(table, day_ref, worker_refs);
        continue;
      }

      self.assign_in_day(table, day_ref, worker_refs);
    }
  }

  pub fn assign_full_day(
    &mut self,
    table: &mut ExtraScheduleTable,
    day_ref: DayRef,
    worker_refs: &mut WorkerRefArray,
  ) {
    let duty_refs = day_ref.get_duty_ref_pairs().joined();

    worker_refs.randomize();

    for worker_ref in worker_refs.iter() {
      self.try_assign(table, worker_ref, &duty_refs);
    }
  }

  pub fn assign_in_pairs(
    &mut self,
    table: &mut ExtraScheduleTable,
    day_ref: DayRef,
    worker_refs: &mut WorkerRefArray,
  ) {
    let mut duty_ref_pairs = day_ref.get_duty_ref_pairs();

    let is_monday = table.month.week_day_of(day_ref.get_index()) == week_days::MONDAY;

    if is_monday {
      duty_ref_pairs.randomize();
    }

    worker_refs.randomize();

    let first_pair = duty_ref_pairs.get_first_pair();

    for worker_ref in worker_refs.iter() {
      self.try_assign(table, worker_ref, &first_pair);
    }

    worker_refs.randomize();

    let second_pair = duty_ref_pairs.get_second_pair();

    for worker_ref in worker_refs.iter() {
      self.try_assign(table, worker_ref, &second_pair);
    }
  }

  pub fn assign_in_day(
    &mut self,
    table: &mut ExtraScheduleTable,
    day_ref: DayRef,
    worker_refs: &mut WorkerRefArray,
  ) {
    let mut duty_refs = day_ref.get_duty_ref_pairs().joined();

    duty_refs.randomize();

    for duty_ref in duty_refs.iter() {
      let should_pass_duty = self.step.pass_duty_when;
      if should_pass_duty(PreAssignDutyInfo {
        table,
        duty_ref,
        duty: table.get_duty(duty_ref),
      }) {
        continue;
      }

      let iterable_duty_ref = duty_ref.into_iterable();

      for worker_ref in worker_refs.iter() {
        self.try_assign(table, worker_ref, &iterable_duty_ref);
      }
    }
  }

  pub fn try_assign(
    &self,
    table: &mut ExtraScheduleTable,
    worker_ref: WorkerRef,
    duty_refs: &impl RefIterable<DutyRef>,
  ) -> bool {
    if self.can_assing(table, duty_refs.iter(), worker_ref) == false {
      return false;
    }

    table.add_worker_to_duties(duty_refs.iter(), worker_ref);

    return true;
  }

  pub fn can_assing(
    &self,
    table: &mut ExtraScheduleTable,
    duty_refs: RefIterator<DutyRef>,
    worker_ref: WorkerRef,
  ) -> bool {
    let assign_size = duty_refs.get_len() as u8;

    for duty_ref in duty_refs {
      let worker = table.get_worker(worker_ref);
      let worker_assigment_info = table.get_worker_assigment_info(worker_ref);
      let duty = table.get_duty(duty_ref);

      // [rule set]

      // duty capacity rule
      if duty.is_full() {
        return false;
      }

      // duty limit rule
      if duty.workers_len >= self.current_duty_limit {
        return false;
      }

      // worker limit rule
      if worker_assigment_info.assigment_count >= worker.assign_limit {
        return false;
      }

      // fem rule
      if worker.gender.is_fem() && duty.is_empty() {
        return false;
      }

      // insp rule
      if worker.grad.is_insp() && duty.insp_count > 0 {
        return false;
      }

      // duty already has worker rule
      if duty.has(worker_ref) {
        return false;
      }

      let assing_info = AssignInfo {
        table,
        assign_size,
        day_ref: DayRef::from_index(duty_ref.day),
        duty,
        duty_ref,
        worker,
        worker_ref,
      };

      for rule in self.assign_rules.iter() {
        if rule(&assing_info) == false {
          return false;
        }
      }
    }

    return true;
  }
}
