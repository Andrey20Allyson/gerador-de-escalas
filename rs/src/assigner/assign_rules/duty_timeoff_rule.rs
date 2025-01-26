use crate::{assigner::assigner::AssignInfo, schedule::constants::DUTY_QUANTITY};

pub fn collides_with_timeoff(info: &AssignInfo) -> bool {
  let duty_index = info.duty_ref.get_duty_index();
  let distance = 6;

  let mut first_index = duty_index.checked_sub(distance).unwrap_or(0);

  if first_index == 0 {
    first_index = 1;
  }

  let mut last_index = duty_index + distance;

  if last_index > DUTY_QUANTITY {
    last_index = DUTY_QUANTITY;
  }

  for index in first_index..=last_index {
    let duty = info.table.get_duty_by_index(index);

    if duty.has(info.worker_ref) {
      return true;
    }
  }

  false
}

pub fn can_assing(info: &AssignInfo) -> bool {
  !collides_with_timeoff(info)
}
