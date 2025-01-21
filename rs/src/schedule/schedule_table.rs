use super::{
  constants::{DUTY_QUANTITY, U8_NULL, WORKER_LIMIT},
  day_ref::{DayRef, DayRefArray},
  duty::ExtraDuty,
  duty_ref::{DutyRef, RefIterator},
  month::Month,
  worker::Worker,
  worker_ref::{WorkerRef, WorkerRefArray},
};

#[derive(Clone, Copy)]
pub struct WorkerAssigmentInfo {
  pub assigment_count: u8,
}

impl WorkerAssigmentInfo {
  pub fn new() -> Self {
    WorkerAssigmentInfo { assigment_count: 0 }
  }

  pub fn add_assigment_count(&mut self) {
    self.assigment_count += 1;
  }

  pub fn sub_assigment_count(&mut self) {
    self.assigment_count -= 1;
  }

  pub fn reset_assigment_count(&mut self) {
    self.assigment_count = 0;
  }
}

impl Default for WorkerAssigmentInfo {
  fn default() -> Self {
    WorkerAssigmentInfo {
      assigment_count: U8_NULL,
    }
  }
}

#[derive(Clone, Copy)]
pub struct ExtraScheduleTable {
  pub month: Month,
  pub duties: [ExtraDuty; DUTY_QUANTITY],
  pub workers: [Worker; WORKER_LIMIT],
  pub worker_assigment_infos: [WorkerAssigmentInfo; WORKER_LIMIT],
  pub workers_len: u8,
}

impl ExtraScheduleTable {
  pub fn new(month: Month) -> Self {
    ExtraScheduleTable {
      month,
      duties: [Default::default(); DUTY_QUANTITY],
      workers: [Default::default(); WORKER_LIMIT],
      worker_assigment_infos: [Default::default(); WORKER_LIMIT],
      workers_len: 0,
    }
  }

  pub fn add_worker_to_duty(&mut self, duty_ref: DutyRef, worker_ref: WorkerRef) {
    let worker_grad = self.get_worker(worker_ref).grad;

    let worker_assigment_info = self.get_worker_assigment_info_mut(worker_ref);

    worker_assigment_info.add_assigment_count();

    let duty = self.get_duty_mut(duty_ref);

    duty.workers[duty.workers_len as usize] = worker_ref;
    duty.workers_len += 1;

    if worker_grad.is_insp() {
      duty.insp_count += 1;
    } else if worker_grad.is_sub() {
      duty.sub_count += 1;
    }
  }

  pub fn add_worker_to_duties(&mut self, duty_refs: RefIterator<DutyRef>, worker_ref: WorkerRef) {
    for duty_ref in duty_refs {
      self.add_worker_to_duty(duty_ref, worker_ref);
    }
  }

  pub fn get_duty(&self, duty_ref: DutyRef) -> &ExtraDuty {
    &self.duties[duty_ref.get_duty_index()]
  }

  pub fn get_duty_mut(&mut self, duty_ref: DutyRef) -> &mut ExtraDuty {
    &mut self.duties[duty_ref.get_duty_index()]
  }

  pub fn add_worker(&mut self, worker: Worker) {
    self.workers[self.workers_len as usize] = worker;
    self.worker_assigment_infos[self.workers_len as usize] = WorkerAssigmentInfo::new();
    self.workers_len += 1;
  }

  pub fn get_worker(&self, worker_ref: WorkerRef) -> &Worker {
    &self.workers[worker_ref.0 as usize]
  }

  pub fn get_worker_assigment_info_mut(
    &mut self,
    worker_ref: WorkerRef,
  ) -> &mut WorkerAssigmentInfo {
    &mut self.worker_assigment_infos[worker_ref.into_index()]
  }

  pub fn get_worker_assigment_info(&self, worker_ref: WorkerRef) -> &WorkerAssigmentInfo {
    &self.worker_assigment_infos[worker_ref.into_index()]
  }

  pub fn is_worker_reached_limit(&self, worker_ref: WorkerRef) -> bool {
    let worker = self.get_worker(worker_ref);
    let worker_info = self.get_worker_assigment_info(worker_ref);

    let reached_limit = worker_info.assigment_count >= worker.assign_limit;

    reached_limit
  }

  pub fn get_worker_ref_array(&self) -> WorkerRefArray {
    let mut array: [WorkerRef; WORKER_LIMIT] = [Default::default(); WORKER_LIMIT];
    let mut len: usize = 0;

    for i in 0..self.workers_len {
      array[len] = WorkerRef(i);
      len += 1;
    }

    WorkerRefArray::new(array, len)
  }

  pub fn get_day_ref_array(&self) -> DayRefArray {
    let range = 0..self.month.get_num_of_days();

    DayRefArray::from_range(range)
  }

  pub fn get_next_day(&self, day_ref: DayRef) -> DayRef {
    let index = day_ref.get_index();
    let last_index = self.month.get_num_of_days() - 1;

    let next_index = index + 1;
    if next_index > last_index {
      return DayRef::from_index(0).unwrap();
    }

    DayRef::from_index(next_index).unwrap()
  }

  pub fn get_prev_day(&self, day_ref: DayRef) -> DayRef {
    let index = day_ref.get_index() as i8;

    let prev_index = index - 1;
    if prev_index < 0 {
      let last_index = self.month.get_num_of_days() - 1;

      return DayRef::from_index(last_index).unwrap();
    }

    DayRef::from_index(prev_index as u8).unwrap()
  }
}
