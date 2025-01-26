#![deny(clippy::all)]

use napi_derive::napi;

#[derive(Clone)]
#[napi(js_name = "Month", object)]
pub struct JsMonthConfig {
  pub year: i32,
  pub index: i32,
}

#[derive(Clone)]
#[napi(object)]
pub struct JsWorkerOrdinaryInfoConfig {
  pub work_days: Vec<u8>,
  pub start: u8,
  pub duration: u8,
  pub is_daily_worker: bool,
}

#[derive(Clone)]
#[napi(js_name = "WorkerInfoConfig", object)]
pub struct JsWorkerInfoConfig {
  pub id: u32,
  pub gender: u8,
  pub grad: u8,
  pub ordinary_info: JsWorkerOrdinaryInfoConfig,
}

#[derive(Clone)]
#[napi(js_name = "QualifierConfig", object)]
pub struct JsQualifierConfig {
  pub tries_limit: u32,
  pub thread_cap: Option<u32>,
  pub use_threads: Option<bool>,
}

#[derive(Clone)]
#[napi(object)]
pub struct JsExtraScheduleTableCreateConfig {
  pub qualifier: JsQualifierConfig,
  pub month: JsMonthConfig,
  pub workers: Vec<JsWorkerInfoConfig>,
}
