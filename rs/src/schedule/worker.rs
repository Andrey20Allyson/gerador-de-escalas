use super::{constants::U8_NULL, ordinary_info::OrdinaryInfo};

#[derive(Clone, Copy, Debug)]
pub struct Worker {
  pub id: u32,
  pub gender: Gender,
  pub grad: Graduation,
  pub assign_limit: u8,
  pub ordinary_info: OrdinaryInfo,
}

impl Default for Worker {
  fn default() -> Self {
    Worker {
      id: 0,
      gender: Gender(U8_NULL),
      grad: Graduation(U8_NULL),
      assign_limit: 10,
      ordinary_info: OrdinaryInfo::default(),
    }
  }
}

#[derive(Clone, Copy, Debug)]
pub struct Gender(pub u8);

impl Gender {
  pub fn is_male(&self) -> bool {
    self.0 == 1
  }

  pub fn is_fem(&self) -> bool {
    self.0 == 2
  }
}

#[derive(Clone, Copy, Debug)]
pub struct Graduation(pub u8);

impl Graduation {
  pub fn is_insp(&self) -> bool {
    self.0 == 1
  }

  pub fn is_sub(&self) -> bool {
    self.0 == 2
  }

  pub fn is_gcm(&self) -> bool {
    self.0 == 3
  }
}
