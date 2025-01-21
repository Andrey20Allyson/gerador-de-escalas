use rand::Rng;

use super::{
  constants::{DUTY_PER_DAY, DUTY_PER_PAIR, U8_NULL},
  day_ref::DayRef,
};

#[derive(Clone, Copy)]
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

  pub fn get_duty_index(&self) -> usize {
    if self.is_null() {
      panic!("Null Reference Error")
    }
    (self.day * 4 + self.index) as usize
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
