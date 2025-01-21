use napi_derive::napi;

use crate::{
  qualifier::{
    integrity_checkers::{correct_worker_allocation, gcm_only},
    qualifier::Qualifier,
  },
  schedule::{
    day_ref::DayRef,
    duty_ref::RefIterable,
    month::Month,
    schedule_table::ExtraScheduleTable,
    worker::{Gender, Graduation, Worker},
  },
};

use super::{
  schedule_table::JsExtraScheduleTableCreateConfig, scheduler_defaults::get_default_assign_steps,
};

#[napi(js_name = "ScheduleAssignState", object)]
pub struct JsScheduleAssignState {
  pub worker_id: u32,
  pub duty_index: u8,
  pub day_index: u8,
}

#[napi(js_name = "ExtraScheduleTableOutputConfig", object)]
pub struct JsExtraScheduleTableOutputConfig {
  pub assign_state: Vec<JsScheduleAssignState>,
}

#[napi]
pub fn generate_schedule(
  config: JsExtraScheduleTableCreateConfig,
) -> JsExtraScheduleTableOutputConfig {
  let assign_steps = get_default_assign_steps();

  let mut table = create_schedule_table(&config).unwrap();
  let mut qualifier: Qualifier = Qualifier::new();

  qualifier
    .set_thread_cap(config.qualifier.thread_cap.map(|value| value as usize))
    .set_tries_limit(config.qualifier.tries_limit)
    .set_assign_configs(assign_steps)
    .set_integrity_checkers(vec![correct_worker_allocation::check, gcm_only::check]);

  if config.qualifier.use_threads.unwrap_or(true) {
    qualifier.qualify_with_threads(&mut table);
  } else {
    qualifier.qualify(&mut table);
  }

  create_output_config(&table)
}

fn create_schedule_table(
  config: &JsExtraScheduleTableCreateConfig,
) -> Result<ExtraScheduleTable, Box<dyn std::error::Error>> {
  let month = Month::new(config.month.year as u16, config.month.index as u16);

  let mut table = ExtraScheduleTable::new(month);

  for worker_config in config.workers.iter() {
    let mut worker = Worker {
      id: worker_config.id,
      gender: Gender(worker_config.gender),
      grad: Graduation(worker_config.grad),
      ..Default::default()
    };

    let d = DayRef::from_index(2)?;

    worker.ordinary_info.set_work_day_to_true(d);

    table.add_worker(worker);
  }

  Ok(table)
}

fn create_output_config(table: &ExtraScheduleTable) -> JsExtraScheduleTableOutputConfig {
  let mut vec: Vec<JsScheduleAssignState> = Vec::new();

  for day_ref in table.get_day_ref_array().iter() {
    for duty_ref in day_ref.get_duty_ref_array().iter() {
      let duty = table.get_duty(duty_ref);

      for worker_ref in duty.iter_worker_refs() {
        let worker = table.get_worker(worker_ref);

        let state = JsScheduleAssignState {
          duty_index: duty_ref.index,
          day_index: duty_ref.day,
          worker_id: worker.id,
        };

        vec.push(state);
      }
    }
  }

  JsExtraScheduleTableOutputConfig { assign_state: vec }
}
