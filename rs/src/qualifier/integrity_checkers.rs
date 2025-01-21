pub mod correct_worker_allocation {
  use crate::{
    qualifier::qualifier::{InconsistenceWarning, IntegritySummary},
    schedule::{duty_ref::RefIterable, schedule_table::ExtraScheduleTable},
  };

  fn calculate_penality(worker_positions_left: u8) -> u32 {
    let base_penality: u32 = 15_600;

    base_penality * worker_positions_left.pow(2) as u32
  }

  fn every_duty_is_worker_suficient(table: &ExtraScheduleTable) -> bool {
    for day_ref in table.get_day_ref_array().iter() {
      for duty_ref in day_ref.get_duty_ref_array().iter() {
        let duty = table.get_duty(duty_ref);

        if duty.workers_len < 2 {
          return true;
        }
      }
    }

    return false;
  }

  pub fn check(summary: &mut IntegritySummary, table: &ExtraScheduleTable) {
    if every_duty_is_worker_suficient(table) {
      return;
    }

    for worker_ref in table.get_worker_ref_array().iter() {
      let worker = table.get_worker(worker_ref);

      // TODO days off validation

      let worker_assignment_info = table.get_worker_assigment_info(worker_ref);

      let positions_left = worker.assign_limit - worker_assignment_info.assigment_count;

      if positions_left == 0 {
        continue;
      }

      let penality = calculate_penality(positions_left);

      summary.register(InconsistenceWarning::IncorrectAllocation.with_penality(penality));
    }
  }
}

pub mod gcm_only {
  use crate::{
    qualifier::qualifier::{InconsistenceWarning, IntegritySummary},
    schedule::{duty_ref::RefIterable, schedule_table::ExtraScheduleTable},
  };

  pub fn check(summary: &mut IntegritySummary, table: &ExtraScheduleTable) {
    let mut num_of_graduate_pair = 0;
    let mut num_of_duties_gcm_only = 0;

    for day_ref in table.get_day_ref_array().iter() {
      for duty_ref in day_ref.get_duty_ref_array().iter() {
        let duty = table.get_duty(duty_ref);

        if !duty.has_insp_or_sub() {
          num_of_duties_gcm_only += 1;
        }

        if duty.insp_count + duty.sub_count >= 2 {
          num_of_graduate_pair += 1;
        }
      }
    }

    if num_of_duties_gcm_only > 0 {
      let inconsistence =
        InconsistenceWarning::GMCOnlyDuty.with_penality(num_of_graduate_pair * 5_000);

      summary.register(inconsistence);
    }
  }
}
