use crate::{assigner::assigner::AssignInfo, schedule::constants::week_days};

// fn hasnt_timeoff(info: &AssignInfo) -> bool {
//   // TODO remove daily worker at extra with out timeoff from ordinary at jiquia
//   if info.worker.ordinary_info.is_daily_worker {
//     return true;
//   }

//   false
// }

pub fn can_assing(info: &AssignInfo) -> bool {
  if is_daily_worker_at_friday_at_night(info) {
    return true;
  }

  !collides_with_todays_ordinary(info)
    && !collides_with_tomorrow_ordinary(info)
    && !collides_with_yesterday_work(info)
}

fn collides_with_todays_ordinary(info: &AssignInfo) -> bool {
  let ordinary_day_index = info.day_ref.get_index();
  let have_ordinary = info
    .worker
    .ordinary_info
    .has_work_at_day(ordinary_day_index);

  if have_ordinary == false {
    return false;
  }

  let ordinary_info = &info.worker.ordinary_info;

  let timeoff_start = info.duty_ref.timeoff_start(info.assign_size);
  let timeoff_end = info.duty_ref.timeoff_end(info.assign_size);

  return timeoff_end > ordinary_info.start && ordinary_info.end() > timeoff_start;
}

fn collides_with_tomorrow_ordinary(info: &AssignInfo) -> bool {
  let next_day_index = info.day_ref.get_index() + 1;
  let have_ordinary_tomorrow = info.worker.ordinary_info.has_work_at_day(next_day_index);
  if have_ordinary_tomorrow == false {
    return false;
  }

  let ordinary_info = &info.worker.ordinary_info;

  let timeoff_end = info.duty_ref.timeoff_end(info.assign_size);

  return timeoff_end > ordinary_info.start + 24;
}

fn collides_with_yesterday_work(info: &AssignInfo) -> bool {
  let day_index = info.day_ref.get_index();
  if day_index == 0 {
    return false;
  }

  let ordinary_day_index = day_index - 1;
  let have_ordinary = info
    .worker
    .ordinary_info
    .has_work_at_day(ordinary_day_index);

  if have_ordinary == false {
    return false;
  }

  let ordinary_info = &info.worker.ordinary_info;

  let timeoff_start = info.duty_ref.timeoff_start(info.assign_size);

  return ordinary_info.end() > timeoff_start + 24;
}

fn is_daily_worker_at_friday_at_night(info: &AssignInfo) -> bool {
  info.worker.ordinary_info.is_daily_worker
    && info.table.month.week_day_of(info.duty_ref.day) == week_days::FRIDAY
    && info.duty_ref.is_last()
    && info.assign_size == 1
}
