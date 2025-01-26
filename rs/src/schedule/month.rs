use super::constants::{week_days, NUM_OF_DAYS_PER_MONTH};

const DAY_OR_WEEK_MONTH_CORRESPONDENCE: [u16; 12] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];

pub fn calc_day_of_week(mut year: u16, mut month: u16, mut day: u16) -> u8 {
  month += 1;
  day += 1;

  year -= if month < 3 { 1 } else { 0 };

  let day_of_week_result = ((year + (year / 4) - (year / 100)
    + (year / 400)
    + DAY_OR_WEEK_MONTH_CORRESPONDENCE[(month - 1) as usize]
    + day)
    % 7) as u8;

  return day_of_week_result;
}

#[derive(Clone, Copy)]
pub struct Month {
  pub year: u16,
  pub index: u16,
  num_of_days: u8,
  first_day_of_week: u8,
}

impl Month {
  pub fn new(year: u16, index: u16) -> Self {
    Month {
      year,
      index,
      num_of_days: NUM_OF_DAYS_PER_MONTH[index as usize],
      first_day_of_week: calc_day_of_week(year, index, 0),
    }
  }

  pub fn get_num_of_days(&self) -> u8 {
    self.num_of_days
  }

  pub fn week_day_of(&self, day: u8) -> u8 {
    (self.first_day_of_week + day) % 7
  }

  pub fn is_week_end(&self, day: u8) -> bool {
    match self.week_day_of(day) {
      week_days::SATURDAY => true,
      week_days::SUNDAY => true,
      _ => false,
    }
  }
}
