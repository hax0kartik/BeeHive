use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Entry {
    name : String,
    has_children : bool
}

impl Entry {
    pub fn new(nm : &str, has_ch : bool) -> Self {
        Self {
            name: nm.to_string(),
            has_children: has_ch
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct Entries {
    entries : Vec::<Entry>
}

impl Entries {
    pub fn new() -> Self {
        Self {
            entries : Vec::new()
        }
    }

    pub fn push_key(&mut self, name: &str, has_children : bool) {
        self.entries.push(Entry::new(name, has_children));
    }
}
