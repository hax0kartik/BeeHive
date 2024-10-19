use std::fs;
use std::fs::File;
use nt_hive2;

pub struct Hive {
    pub filename: String,
    pub hive: Option<nt_hive2::Hive<File, nt_hive2::CleanHive>>
}

impl Hive {
    pub fn new(file_name: &str) -> Self {
        Self {
            filename: file_name.to_string(),
            hive: None
        }
    }

    pub fn create_internal_hive(&mut self) {
        let f = File::open(self.filename.as_str()).unwrap();
        self.hive = Some(nt_hive2::Hive::new(f, nt_hive2::HiveParseMode::NormalWithBaseBlock).expect("Could not create internal hive"));
    }

    pub fn get_root_node(&mut self) -> Result<nt_hive2::KeyNode, binread::Error> {
        let hive = self.hive.as_mut().unwrap();
        let node = hive.root_key_node()?;
        return Ok(node);
    }
}

pub struct Hives {
    sam_hive : Option<Box<Hive>>,
    #[allow(dead_code)]
    user_hive : Option<Box<Hive>>,
    system_hive : Option<Box<Hive>>,
    software_hive: Option<Box<Hive>>,
    security_hive : Option<Box<Hive>>
}

impl Default for Hives {
    fn default() -> Self {
        Self::new()
    }
}

impl Hives {
    pub fn new() -> Self {
        Self {
            sam_hive: None,
            user_hive: None,
            system_hive: None,
            software_hive: None,
            security_hive: None
        }
    }

    #[allow(dead_code)]
    pub fn get_sam_hive(&mut self) -> Option<&mut Box<Hive>> {
        self.sam_hive.as_mut()
    }

    #[allow(dead_code)]
    pub fn get_system_hive(&mut self) -> Option<&mut Box<Hive>> {
        self.system_hive.as_mut()
    }

    #[allow(dead_code)]
    pub fn get_user_hive(&mut self) -> Option<&mut Box<Hive>> {
        self.user_hive.as_mut()
    }

    #[allow(dead_code)]
    pub fn get_security_hive(&mut self) -> Option<&mut Box<Hive>> {
        self.security_hive.as_mut()
    }

    pub fn get_hive_by_name(&mut self, hive_name : &str) -> Option<&mut Box<Hive>> {
        let hive = match hive_name.to_lowercase().as_str() {
            "system" => self.system_hive.as_mut(),
            "user" => self.user_hive.as_mut(),
            "sam" => self.sam_hive.as_mut(),
            "security" => self.security_hive.as_mut(),
            "software" => self.software_hive.as_mut(),

            _ => {
                println!("Get Hive by name : {:?}", hive_name.to_lowercase().as_str());
                unimplemented!();
            }
        };

        return hive;
    }

    pub fn look_for_hives(&mut self, folder_name: &str) {
        let files = fs::read_dir(folder_name).unwrap();

        for file in files {
            if let Ok(file) = file {
                println!("{}", file.path().display());

                let filepath = String::from(file.path().to_str().unwrap()); 
                let filename = file.file_name().into_string().unwrap();

                match filename.as_str() {
                    "SYSTEM" => {
                        let mut hive = Box::new(Hive::new(&filepath));
                        hive.create_internal_hive();
                        self.system_hive = Some(hive);
                    },

                    "SAM" => {
                        let mut hive = Box::new(Hive::new(&filepath));
                        hive.create_internal_hive();
                        self.sam_hive = Some(hive);
                    },

                    "SECURITY" => {
                        let mut hive = Box::new(Hive::new(&filepath));
                        hive.create_internal_hive();
                        self.security_hive = Some(hive);
                    }

                    "SOFTWARE" => {
                        let mut hive = Box::new(Hive::new(&filepath));
                        hive.create_internal_hive();
                        self.software_hive = Some(hive);
                    },

                    &_ => continue,
                }
            } 
        }
    }
}