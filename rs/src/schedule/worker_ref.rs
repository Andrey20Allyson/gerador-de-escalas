use super::{
  constants::{U8_NULL, WORKER_LIMIT},
  randomizer,
  ref_traits::RefArrayRemoveWhere,
};

#[derive(Clone, Copy)]
pub struct WorkerRef(pub u8);

impl WorkerRef {
  pub fn is_null(&self) -> bool {
    self.0 == U8_NULL
  }

  pub fn into_index(&self) -> usize {
    if self.is_null() {
      panic!("Null Reference Error")
    }
    self.0 as usize
  }
}

impl Default for WorkerRef {
  fn default() -> Self {
    WorkerRef(U8_NULL)
  }
}

impl PartialEq for WorkerRef {
  fn eq(&self, other: &Self) -> bool {
    self.0 == other.0
  }
}

pub struct WorkerRefArray {
  array: [WorkerRef; WORKER_LIMIT],
  len: usize,
}

impl WorkerRefArray {
  pub fn new(array: [WorkerRef; WORKER_LIMIT], len: usize) -> Self {
    WorkerRefArray { array, len }
  }

  pub fn randomize(&mut self) {
    randomizer::randomize_array(&mut self.array, self.len);
  }

  pub fn iter(&self) -> WorkerRefIter {
    WorkerRefIter::new(&self.array, self.len)
  }
}

impl RefArrayRemoveWhere<WorkerRef> for WorkerRefArray {
  fn gen_len(&self) -> usize {
    self.len
  }

  fn set_len(&mut self, len: usize) {
    self.len = len;
  }

  fn get_mut_array(&mut self) -> &mut [WorkerRef] {
    &mut self.array
  }
}

pub struct WorkerRefIter<'a> {
  array: &'a [WorkerRef],
  end: usize,
  idx: usize,
}

impl<'a> WorkerRefIter<'a> {
  pub fn new(array: &'a [WorkerRef], end: usize) -> Self {
    WorkerRefIter { array, end, idx: 0 }
  }
}

impl<'a> std::iter::Iterator for WorkerRefIter<'a> {
  type Item = WorkerRef;

  fn next(&mut self) -> Option<Self::Item> {
    if self.idx >= self.end {
      return None;
    }

    let duty_ref = self.array[self.idx];
    self.idx += 1;

    Some(duty_ref)
  }
}
