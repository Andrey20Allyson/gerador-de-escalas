pub const U8_NULL: u8 = 255;

pub const NUM_OF_DAYS_PER_MONTH: [u8; 12] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
pub const WORKER_PER_DUTY: usize = 3;
pub const DUTY_PER_DAY: usize = 4;
pub const DUTY_PER_PAIR: usize = DUTY_PER_DAY / 2;
pub const DAY_LIMIT: usize = 31;
pub const DUTY_QUANTITY: usize = DAY_LIMIT * DUTY_PER_DAY;
pub const WORKER_LIMIT: usize = 32;

pub mod week_days {
  pub const SUNDAY: u8 = 0;
  pub const MONDAY: u8 = 1;
  pub const TUESDAY: u8 = 2;
  pub const WEDNESDAY: u8 = 3;
  pub const THURSDAY: u8 = 4;
  pub const FRIDAY: u8 = 5;
  pub const SATURDAY: u8 = 6;
}
