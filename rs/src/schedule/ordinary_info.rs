#[derive(Debug, Clone, Copy)]
pub struct OrdinaryInfo {
  work_days: u32,
  pub start: i8,
  pub duration: i8,
  pub is_daily_worker: bool,
}

impl OrdinaryInfo {
  pub fn has_work_at_day(&self, day_index: u8) -> bool {
    let result_bit = self.work_days >> day_index & 0b1;

    return result_bit == 0b1;
  }

  pub fn end(&self) -> i8 {
    self.start + self.duration
  }

  pub fn set_work_day_to_true(&mut self, day_index: u8) {
    let swap_digit = 0b1u32 << day_index;

    self.work_days = self.work_days | swap_digit;
  }

  pub fn set_work_day_to_false(&mut self, day_index: u8) {
    let swap_digit = 0b1u32 << day_index;

    self.work_days = self.work_days & !swap_digit;
  }
}

impl Default for OrdinaryInfo {
  fn default() -> Self {
    OrdinaryInfo {
      work_days: 0b0,
      start: 0,
      duration: 0,
      is_daily_worker: false,
    }
  }
}
