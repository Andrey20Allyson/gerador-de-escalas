pub trait RefArrayRemoveWhere<T>
where
  T: Copy,
{
  fn remove_where(&mut self, callback: impl Fn(T) -> bool) {
    let old_len = self.gen_len();
    let mut new_len: usize = 0;
    let array = self.get_mut_array();

    for i in 0..old_len {
      let value = array[i];

      let do_remove = callback(value);

      if do_remove {
        continue;
      }

      array[new_len] = value;
      new_len += 1;
    }

    self.set_len(new_len);
  }

  fn get_mut_array(&mut self) -> &mut [T];

  fn gen_len(&self) -> usize;

  fn set_len(&mut self, len: usize);
}
