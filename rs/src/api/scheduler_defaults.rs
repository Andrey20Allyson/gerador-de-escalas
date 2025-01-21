use crate::{assigner::assigner::AssignStep, schedule::constants::week_days};

pub fn get_default_assign_steps() -> Vec<AssignStep> {
  vec![
    AssignStep {
      only_worker_where: |info| info.worker.ordinary_info.duration == 24,
      full_day: true,
      max: 2,
      ..Default::default()
    },
    AssignStep {
      only_worker_where: |info| info.worker.ordinary_info.is_daily_worker,
      pass_day_when: |info| info.table.month.is_week_end(info.day_ref.get_index()),
      min: 3,
      ..Default::default()
    },
    AssignStep {
      only_worker_where: |info| info.worker.ordinary_info.is_daily_worker,
      pass_day_when: |info| info.table.month.is_week_end(info.day_ref.get_index()),
      min: 3,
      duty_min_distance: 1,
      ..Default::default()
    },
    AssignStep {
      only_worker_where: |info| info.worker.ordinary_info.is_daily_worker,
      min: 2,
      in_pairs: false,
      ..Default::default()
    },
    AssignStep {
      only_worker_where: |info| info.worker.grad.is_insp(),
      min: 1,
      ..Default::default()
    },
    AssignStep {
      only_worker_where: |info| info.worker.grad.is_sub(),
      pass_day_when: |info| {
        info.table.month.week_day_of(info.day_ref.get_index()) == week_days::MONDAY
      },
      min: 1,
      max: 2,
      ..Default::default()
    },
    AssignStep {
      pass_day_when: |info| {
        info.table.month.week_day_of(info.day_ref.get_index()) == week_days::MONDAY
      },
      min: 1,
      max: 2,
      ..Default::default()
    },
    AssignStep {
      min: 2,
      max: 3,
      ..Default::default()
    },
    AssignStep {
      in_pairs: false,
      min: 2,
      max: 3,
      ..Default::default()
    },
  ]
}
