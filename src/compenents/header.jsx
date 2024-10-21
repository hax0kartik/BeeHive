import React, { useState, useEffect } from 'react';
import { warn } from '@tauri-apps/plugin-log';
import { open } from '@tauri-apps/plugin-dialog';
import { useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onChange }) => {
    const navigate = useNavigate();
    const [filePath, setFilePath] = useState(location.state?.filePath);
    const [Message, setMessage] = useState('');

    const handleBackClick = () => {
        navigate(-1);
    };

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
                    <li className=''><a>Commons</a></li>
                    <li className=''><a>Classic</a></li>
                    <li className=''><a>Diff View</a></li>
                </ul>
            </div>
            <div className='dropdown dropdown-hover'>
                <div className='btn btn-ghost btn-sm'>Help</div>
                <ul className='dropdown-content menu bg-base-100 shadow w-40 rounded-box z-10'>
                    <li className='' onClick={handleBackClick}><a>Welcome</a></li>
                    <li className=''><a>Preferences...</a></li>
                    <li className=''><a>About</a></li>
                </ul>
            </div>
        </ul>
    );
};

export default Header;