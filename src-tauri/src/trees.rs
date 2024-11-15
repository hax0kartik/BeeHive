use serde::{Serialize, Deserialize};
use serde_json::json;
use std::collections::HashMap;

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

#[derive(Serialize, Deserialize)]
pub struct KeyValue {
    entries : HashMap::<String, String>
}

impl KeyValue {
    pub fn new() -> Self {
        Self {
            entries : HashMap::new()
        }
    }

    pub fn push_key(&mut self, name: &str, value: &str) {
        self.entries.insert(name.to_string(), value.to_string());
    }
}


#[derive(Serialize, Deserialize)]
pub struct Node {
    path : String,
    has_children : bool,
    values : HashMap::<String, String>,
    children : HashMap::<String, Node>
}

impl Node {
    pub fn new(key: &str, has_children: bool) -> Self {
        Self {
            path : key.to_string(),
            has_children : has_children,
            values : HashMap::new(),
            children : HashMap::new()
        }
    }
    
    pub fn insert_child(&mut self, key: &str, node : Node) {
        self.children.insert(key.to_string(), node);
    }

    pub fn insert_value(&mut self, key: &str, value : &str) {
        self.values.insert(key.to_string(), value.to_string());
    }

    pub fn print(&mut self) {
        let mut buf = Vec::new();
        let formatter = serde_json::ser::PrettyFormatter::with_indent(b"    ");
        let mut ser = serde_json::Serializer::with_formatter(&mut buf, formatter);
        self.serialize(&mut ser).unwrap();
        println!("{}", String::from_utf8(buf).unwrap());
    }
}

#[derive(Serialize, Deserialize)]
pub struct Nodes {
    nodes : Vec::<Node>
}

impl Nodes {
    pub fn new() -> Self {
        Self {
            nodes : Vec::new()
        }
    }

    pub fn push_node(&mut self, node: Node) {
        self.nodes.push(node);
    }
}
