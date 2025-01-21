use crate::{
  assigner::assigner::{AssignStep, ScheduleAssigner},
  schedule::schedule_table::ExtraScheduleTable,
};

#[derive(Debug, Clone, Copy)]
pub enum InconsistenceWarning {
  IncorrectAllocation,
  DutyMinQuantity,
  GMCOnlyDuty,
}

impl InconsistenceWarning {
  pub fn with_penality(self, penality: u32) -> ScheduleInconsistence {
    ScheduleInconsistence::Warning {
      warning: self,
      penality,
    }
  }
}

#[derive(Debug, Clone, Copy)]
pub enum InconsistenceFailure {
  FemaleOnlyDuty,
}

impl InconsistenceFailure {
  pub fn with_penality(self, penality: u32) -> ScheduleInconsistence {
    ScheduleInconsistence::Failure {
      failure: self,
      penality,
    }
  }
}

#[derive(Debug, Clone, Copy)]
pub enum ScheduleInconsistence {
  Warning {
    warning: InconsistenceWarning,
    penality: u32,
  },
  Failure {
    failure: InconsistenceFailure,
    penality: u32,
  },
}

impl From<InconsistenceFailure> for ScheduleInconsistence {
  fn from(value: InconsistenceFailure) -> Self {
    ScheduleInconsistence::Failure {
      failure: value,
      penality: 0,
    }
  }
}

#[derive(Debug)]
pub struct IntegritySummary {
  pub penality: u32,
  pub has_failure: bool,
}

impl IntegritySummary {
  pub fn new() -> Self {
    IntegritySummary {
      penality: 0,
      has_failure: false,
    }
  }

  pub fn wrost() -> Self {
    IntegritySummary {
      penality: !0,
      has_failure: true,
    }
  }

  pub fn register(&mut self, inconsistence: ScheduleInconsistence) {
    match inconsistence {
      ScheduleInconsistence::Failure {
        failure: _,
        penality,
      } => {
        self.penality += penality;
        self.has_failure = true;
      }
      ScheduleInconsistence::Warning {
        warning: _,
        penality,
      } => {
        self.penality += penality;
      }
    };
  }

  fn is_perfect(&self) -> bool {
    // self.penality == 0
    false
  }

  fn is_better_than(&self, other: &Self) -> bool {
    if !self.has_failure && other.has_failure {
      return true;
    }

    if self.has_failure && !other.has_failure {
      return false;
    }

    self.penality < other.penality
  }
}

type IntegrityChecker = fn(&mut IntegritySummary, &ExtraScheduleTable) -> ();

#[derive(Clone)]
pub struct Qualifier {
  pub tries_limit: u32,
  pub assign_steps: Vec<AssignStep>,
  pub integrity_checkers: Vec<IntegrityChecker>,
  pub thread_cap: Option<usize>,
  pub assinger: ScheduleAssigner,
}

impl Qualifier {
  pub fn new() -> Self {
    Qualifier {
      tries_limit: 1,
      thread_cap: None,
      assign_steps: Vec::new(),
      integrity_checkers: Vec::new(),
      assinger: ScheduleAssigner::new(),
    }
  }

  pub fn set_tries_limit(&mut self, tries_limit: u32) -> &mut Self {
    self.tries_limit = tries_limit;

    self
  }

  pub fn set_assign_configs(&mut self, assign_configs: Vec<AssignStep>) -> &mut Self {
    self.assign_steps = assign_configs;

    self
  }

  pub fn set_integrity_checkers(&mut self, integrity_checkers: Vec<IntegrityChecker>) -> &mut Self {
    self.integrity_checkers = integrity_checkers;

    self
  }

  pub fn set_thread_cap(&mut self, thread_cap: Option<usize>) -> &mut Self {
    self.thread_cap = thread_cap;

    self
  }

  pub fn qualify(&mut self, table: &mut ExtraScheduleTable) {
    let mut best_clone = *table;
    let mut best_integrity = IntegritySummary::wrost();

    for _ in 0..self.tries_limit {
      let mut current_clone = *table;

      self.assign(&mut current_clone);

      let current_integrity = self.check_integrity(table);

      if current_integrity.is_perfect() {
        *table = current_clone;
        return;
      }

      if current_integrity.is_better_than(&best_integrity) {
        best_clone = current_clone;
        best_integrity = current_integrity;
      }
    }

    *table = best_clone;
  }

  pub fn qualify_with_threads(&mut self, table: &mut ExtraScheduleTable) {
    let available_threads = match self.get_available_threads() {
      Some(thread_count) => thread_count,
      None => {
        self.qualify(table);
        return;
      }
    };

    let mut handlers = Vec::new();

    let tries_limit = (self.tries_limit / available_threads as u32).max(1);

    for _ in 0..available_threads {
      let mut qualifier_clone = self.clone();
      let mut table_clone = *table;

      let handle: std::thread::JoinHandle<ExtraScheduleTable> = std::thread::spawn(move || {
        qualifier_clone.set_tries_limit(tries_limit);
        qualifier_clone.qualify(&mut table_clone);

        table_clone
      });

      handlers.push(handle);
    }

    let mut best_clone = *table;
    let mut best_integrity = IntegritySummary::wrost();

    for handle in handlers {
      let current_clone = handle.join().unwrap();
      let current_integrity = self.check_integrity(table);

      if current_integrity.is_better_than(&best_integrity) {
        best_clone = current_clone;
        best_integrity = current_integrity;
      }
    }

    *table = best_clone;
  }

  fn get_available_threads(&self) -> Option<usize> {
    let thread_count = thread_count();

    match thread_count {
      Some(thread_count) => match self.thread_cap {
        Some(thread_cap) => Some(thread_count.min(thread_cap)),
        None => Some(thread_count),
      },
      None => None,
    }
  }

  pub fn check_integrity(&self, table: &ExtraScheduleTable) -> IntegritySummary {
    let mut summary = IntegritySummary::new();

    for checker in self.integrity_checkers.iter() {
      checker(&mut summary, table);
    }

    summary
  }

  pub fn assign(&mut self, table: &mut ExtraScheduleTable) {
    let assigner = &mut self.assinger;

    for step in self.assign_steps.iter() {
      assigner.set_step(step);

      assigner.assign(table);
    }
  }
}

fn thread_count() -> Option<usize> {
  match std::thread::available_parallelism() {
    Ok(count) => Some(count.get()),
    Err(_) => None,
  }
}
