use super::{
  constants::{DAY_LIMIT, U8_NULL},
  duty_ref::DutyRefPairs,
  randomizer,
  ref_traits::{RefArrayLike, RefArrayRemoveWhere},
};

#[derive(Debug)]
pub enum DayRefError {
  IncorrectDayIndexInfo(u8),
}

impl std::fmt::Display for DayRefError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      DayRefError::IncorrectDayIndexInfo(index) => {
        write!(f, "Can't turn u8 {} into a DayRef", index)
      }
    }
  }
}

impl std::error::Error for DayRefError {}

#[derive(Clone, Copy, Debug)]
pub struct DayRef(u8);

impl DayRef {
  pub fn from_index(index: u8) -> Self {
    DayRef(index)
  }

  pub fn get_index(&self) -> u8 {
    self.0
  }

  pub fn get_duty_ref_pairs(self) -> DutyRefPairs {
    DutyRefPairs::from_day_ref(self)
  }
}

impl Default for DayRef {
  fn default() -> Self {
    DayRef(U8_NULL)
  }
}

#[derive(Debug)]
pub struct DayRefArray {
  array: [DayRef; DAY_LIMIT],
  len: usize,
}

impl DayRefArray {
  pub fn from_range(range: std::ops::Range<u8>) -> DayRefArray {
    let mut array: [DayRef; DAY_LIMIT] = [Default::default(); DAY_LIMIT];
    let mut len: usize = 0;

    for day in range {
      array[len] = DayRef(day);
      len += 1;
    }

    DayRefArray { array, len }
  }

  pub fn randomize(&mut self) {
    randomizer::randomize_array(&mut self.array, self.len);
  }

  pub fn iter(&self) -> DayRefIter<'_> {
    return DayRefIter {
      array: &self,
      iter_count: 0,
    };
  }
}

impl RefArrayLike<DayRef> for DayRefArray {
  fn gen_len(&self) -> usize {
    self.len
  }

  fn set_len(&mut self, len: usize) {
    self.len = len;
  }

  fn get_mut_array(&mut self) -> &mut [DayRef] {
    &mut self.array
  }
}

impl RefArrayRemoveWhere<DayRef> for DayRefArray {}

pub struct DayRefIter<'a> {
  array: &'a DayRefArray,
  iter_count: usize,
}

impl<'a> std::iter::Iterator for DayRefIter<'a> {
  type Item = DayRef;

  fn next(&mut self) -> Option<Self::Item> {
    if self.iter_count >= self.array.len {
      return None;
    }

    let day_ref = self.array.array[self.iter_count];
    self.iter_count += 1;

    Some(day_ref)
  }
}
