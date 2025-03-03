import React, { useState, useEffect } from 'react';
import { warn } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-dialog';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onChange }) => {
    const navigate = useNavigate();
    const [filePath, setFilePath] = useState(location.state?.filePath);
    const [Message, setMessage] = useState('');

    const home = () => {
        navigate('/');
    };

    const common = () => {
        //   navigate('/common', { state: { Message:Message, filePath: filePath, System:System, Security:Security, Software:Software, Sam:Sam, User:User } });
        navigate('/common', { state: { Message: Message, filePath: filePath } });
    };

    const diff = () => {
        navigate('/diff_landing');
    }

    const classic = () => {
        navigate("/classic", { state: {filePath : filePath } });
    }

    useEffect(() => {
        onChange({ filePath, Message });
    }, [filePath, Message]);

    async function selectFile() {
        warn("Select file called");
        const file = await open({
            multiple: false,
            directory: true,
            filters: [],
        });

        if (!file) {
            warn("No folder selected");
            return;
        }

        warn("Folder selected: " + file);
        setFilePath(file);
    }
    return (
        <ul className='menu menu-horizontal gap-2 bg-base-300'>
            <div className='dropdown dropdown-hover'>
                <div className='btn btn-ghost btn-sm'>Folder</div>
                <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
                    <li><a onClick={selectFile}>Open Folder</a></li>
                    <li><a>Create Backup</a></li>
                </ul>
            </div>
            <div className='dropdown dropdown-hover'>
                <div className='btn btn-ghost btn-sm'>Mode</div>
                <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
                    <li className=''><a onClick={common}>Commons</a></li>
                    <li className=''><a onClick={classic}>Classic</a></li>
                    <li className=''><a onClick={diff}>Diff View</a></li>
                </ul>
            </div>
            <div className='dropdown dropdown-hover'>
                <div className='btn btn-ghost btn-sm'>Help</div>
                <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
                    <li className='' onClick={home}><a>Welcome</a></li>
                    <li className=''><a>Preferences...</a></li>
                    <li className=''><a>About</a></li>
                </ul>
            </div>
        </ul>
    );
};

export default Header;