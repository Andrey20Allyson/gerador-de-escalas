use rand::Rng;

pub fn randomize_array<T>(arr: &mut [T], len: usize)
where
  T: Copy,
{
  let mut i = len - 1;
  while i > 0 {
    let j = rand::thread_rng().gen_range(0..len);

    (arr[i], arr[j]) = (arr[j], arr[i]);

    i -= 1;
  }
}

pub fn random_chance(chance: f64) -> bool {
  rand::thread_rng().gen_bool(chance)
}
