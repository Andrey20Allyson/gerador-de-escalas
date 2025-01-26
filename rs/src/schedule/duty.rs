use super::{
  constants::WORKER_PER_DUTY,
  worker_ref::{WorkerRef, WorkerRefIter},
};

#[derive(Clone, Copy)]
pub struct ExtraDuty {
  pub workers: [WorkerRef; WORKER_PER_DUTY],
  pub workers_len: u8,
  pub insp_count: u8,
  pub sub_count: u8,
}

impl ExtraDuty {
  pub fn has(&self, wref: WorkerRef) -> bool {
    if self.workers_len == 0 {
      return false;
    }

    let wref_1 = self.workers[0];

    if wref == wref_1 {
      return true;
    }

    if self.workers_len == 1 {
      return false;
    }

    let wref_2 = self.workers[1];

    if wref == wref_2 {
      return true;
    }

    if self.workers_len == 2 {
      return false;
    }

    let wref_3 = self.workers[2];

    if wref == wref_3 {
      return true;
    }

    return false;
  }

  pub fn has_insp_or_sub(&self) -> bool {
    self.insp_count > 0 || self.sub_count > 0
  }

  pub fn is_empty(&self) -> bool {
    self.workers_len == 0
  }

  pub fn is_full(&self) -> bool {
    self.workers_len == WORKER_PER_DUTY as u8
  }

  pub fn iter_worker_refs(&self) -> WorkerRefIter {
    WorkerRefIter::new(&self.workers, self.workers_len as usize)
  }
}

impl Default for ExtraDuty {
  fn default() -> Self {
    ExtraDuty {
      workers: [Default::default(); WORKER_PER_DUTY],
      workers_len: 0,
      insp_count: 0,
      sub_count: 0,
    }
  }
}
