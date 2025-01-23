use rand::Rng;

use super::{
  constants::{DUTY_PER_DAY, DUTY_PER_PAIR, U8_NULL},
  day_ref::DayRef,
  ref_traits::{RefArrayLike, RefArrayRandomize},
};

#[derive(Debug, Clone, Copy)]
pub struct DutyRef {
  pub day: u8,
  pub index: u8,
}

impl DutyRef {
  pub fn new(day: u8, index: u8) -> Self {
    DutyRef { day, index }
  }

  pub fn resolve_index(day: u8, index: i16) -> Self {
    let duty_per_day = DUTY_PER_DAY as i16;
    let day = day as i16;

    if index >= duty_per_day {
      let num_days_ahead = index / duty_per_day;

      let resolved_day = day + num_days_ahead;
      let resolved_index = index % duty_per_day;

      return DutyRef {
        day: resolved_day as u8,
        index: resolved_index as u8,
      };
    }

    if index < 0 {
      let num_days_back = -index / duty_per_day;

      let resolved_day = day - num_days_back;
      let resolved_index = duty_per_day + index % duty_per_day;

      return DutyRef {
        day: resolved_day as u8,
        index: resolved_index as u8,
      };
    }

    DutyRef {
      day: day as u8,
      index: index as u8,
    }
  }

  pub fn is_null(&self) -> bool {
    self.index == U8_NULL
  }

  pub fn is_last(&self) -> bool {
    self.index as usize == DUTY_PER_DAY + 1
  }

  pub fn get_duty_index(&self) -> usize {
    if self.is_null() {
      panic!("Null Reference Error")
    }
    (self.day * 4 + self.index) as usize
  }

  pub fn get_hour(&self) -> DutyHour {
    DutyHour::from_ref(self)
  }

  pub fn timeoff_start(&self, assign_size: u8) -> i8 {
    self.get_hour().timeoff(assign_size).start
  }

  pub fn timeoff_end(&self, assign_size: u8) -> i8 {
    self.get_hour().timeoff(assign_size).end
  }

  pub fn into_iterable(self) -> IterableDutyRef {
    IterableDutyRef::new(self)
  }
}

impl Default for DutyRef {
  fn default() -> Self {
    DutyRef {
      day: U8_NULL,
      index: U8_NULL,
    }
  }
}

const DUTY_DURATION: i8 = 24 / DUTY_PER_DAY as i8;

const fn calc_duty_hour(index: u8) -> DutyHour {
  let start = (index as i8) * DUTY_DURATION + 1;
  let end = start + DUTY_DURATION;
  let is_nighttime = start >= 18 || start < 7;

  DutyHour {
    start,
    end,
    is_nighttime,
  }
}

const DUTY_HOUR_MAP: [DutyHour; 4] = [
  calc_duty_hour(0),
  calc_duty_hour(1),
  calc_duty_hour(2),
  calc_duty_hour(4),
];

#[derive(Clone, Copy)]
pub struct DutyHour {
  pub start: i8,
  pub end: i8,
  pub is_nighttime: bool,
}

impl DutyHour {
  pub fn from_ref(duty_ref: &DutyRef) -> Self {
    DUTY_HOUR_MAP[duty_ref.index as usize]
  }

  pub fn timeoff(&self, assign_size: u8) -> DutyTimeoff {
    DutyTimeoff::calculate(self, assign_size)
  }
}

#[derive(Clone, Copy)]
pub struct DutyTimeoff {
  pub start: i8,
  pub end: i8,
}

impl DutyTimeoff {
  pub fn calculate(hour: &DutyHour, assign_size: u8) -> Self {
    let start = hour.start - DUTY_DURATION * assign_size as i8;
    let end = hour.end + DUTY_DURATION * assign_size as i8;

    DutyTimeoff { start, end }
  }
}

pub struct IterableDutyRef {
  array: [DutyRef; 1],
}

impl IterableDutyRef {
  pub fn new(duty_ref: DutyRef) -> Self {
    IterableDutyRef { array: [duty_ref] }
  }
}

impl RefIterable<DutyRef> for IterableDutyRef {
  fn iter(&self) -> RefIterator<DutyRef> {
    RefIterator::new(&self.array, 1)
  }
}

#[derive(Clone, Copy)]
pub struct DutyRefOfOneDayArray {
  array: [DutyRef; DUTY_PER_DAY],
  len: usize,
}

impl DutyRefOfOneDayArray {
  pub fn new(array: [DutyRef; DUTY_PER_DAY], len: usize) -> Self {
    DutyRefOfOneDayArray { array, len }
  }
}

impl RefIterable<DutyRef> for DutyRefOfOneDayArray {
  fn iter(&self) -> RefIterator<DutyRef> {
    RefIterator::new(&self.array, self.len)
  }
}

pub trait RefIterable<T>
where
  T: Copy,
{
  fn iter(&self) -> RefIterator<T>;
}

pub struct RefIterator<'a, T>
where
  T: Copy,
{
  array: &'a [T],
  end: usize,
  index: usize,
}

impl<'a, T> RefIterator<'a, T>
where
  T: Copy,
{
  pub fn new(array: &'a [T], end: usize) -> Self {
    RefIterator {
      array,
      end,
      index: 0,
    }
  }

  pub fn get_len(&self) -> usize {
    self.end
  }
}

impl<'a, T> std::iter::Iterator for RefIterator<'a, T>
where
  T: Copy,
{
  type Item = T;

  fn next(&mut self) -> Option<Self::Item> {
    if self.index >= self.end {
      return None;
    }

    let duty_ref = self.array[self.index];
    self.index += 1;

    Some(duty_ref)
  }
}

pub struct DutyRefPairs {
  first_pair: [DutyRef; DUTY_PER_PAIR],
  second_pair: [DutyRef; DUTY_PER_PAIR],
}

impl DutyRefPairs {
  pub fn from_day_ref(day_ref: DayRef) -> Self {
    let first_pair: [DutyRef; DUTY_PER_PAIR] = [
      DutyRef::resolve_index(day_ref.get_index(), 1),
      DutyRef::resolve_index(day_ref.get_index(), 2),
    ];

    let second_pair: [DutyRef; DUTY_PER_PAIR] = [
      DutyRef::resolve_index(day_ref.get_index(), 3),
      DutyRef::resolve_index(day_ref.get_index(), 4),
    ];

    DutyRefPairs {
      first_pair,
      second_pair,
    }
  }

  pub fn get_first_pair(&self) -> DutyRefPair {
    DutyRefPair::new(self.first_pair)
  }

  pub fn get_second_pair(&self) -> DutyRefPair {
    DutyRefPair::new(self.second_pair)
  }

  pub fn joined(&self) -> DutyRefJoinedPairs {
    let mut array = [DutyRef::default(); DUTY_PER_DAY];
    let mut len: usize = 0;

    for duty_ref in self.first_pair {
      array[len] = duty_ref;
      len += 1;
    }

    for duty_ref in self.second_pair {
      array[len] = duty_ref;
      len += 1;
    }

    DutyRefJoinedPairs::new(array)
  }

  pub fn randomize(&mut self) {
    let do_swap = rand::thread_rng().gen_bool(0.5);

    if do_swap {
      (self.first_pair, self.second_pair) = (self.second_pair, self.first_pair);
    }
  }
}

#[derive(Debug)]
pub struct DutyRefJoinedPairs {
  array: [DutyRef; DUTY_PER_DAY],
}

impl DutyRefJoinedPairs {
  pub fn new(array: [DutyRef; DUTY_PER_DAY]) -> Self {
    DutyRefJoinedPairs { array }
  }
}

impl RefIterable<DutyRef> for DutyRefJoinedPairs {
  fn iter(&self) -> RefIterator<DutyRef> {
    RefIterator::new(&self.array, DUTY_PER_DAY)
  }
}

impl RefArrayLike<DutyRef> for DutyRefJoinedPairs {
  fn gen_len(&self) -> usize {
    DUTY_PER_DAY
  }

  fn get_mut_array(&mut self) -> &mut [DutyRef] {
    &mut self.array
  }

  fn set_len(&mut self, _: usize) {}
}

impl RefArrayRandomize<DutyRef> for DutyRefJoinedPairs {}

pub struct DutyRefPair {
  array: [DutyRef; DUTY_PER_PAIR],
}

impl DutyRefPair {
  pub fn new(array: [DutyRef; DUTY_PER_PAIR]) -> Self {
    DutyRefPair { array }
  }
}

impl RefIterable<DutyRef> for DutyRefPair {
  fn iter(&self) -> RefIterator<DutyRef> {
    RefIterator::new(&self.array, DUTY_PER_PAIR)
  }
}
