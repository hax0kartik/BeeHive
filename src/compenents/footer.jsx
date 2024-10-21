import { useEffect, useState } from 'react';

const Footer = (props) => {
  const [System, setSystem] = useState(props.System || false);
  const [Software, setSoftware] = useState(props.Software || false);
  const [Security, setSecurity] = useState(props.Security || false);
  const [Sam, setSam] = useState(props.Sam || false);
  const [User, setUser] = useState(props.User || false);
  
  useEffect(() => {
    setSystem(props.System || false);
    setSoftware(props.Software || false);
    setSecurity(props.Security || false);
    setSam(props.Sam || false);
    setUser(props.User || false);
  }, [props.System, props.Software, props.Security, props.Sam, props.User]);

  return (
    <footer className="flex justify-between footer bg-base-300 pr-5">
      <div className='flex justify-center items-center p-2 gap-4'>
        <p> Loaded Hives: </p>
        <div className='flex gap-1 justify-center items-center'>
          <div className={`badge ${User ? 'badge-success' : 'badge-error'} badge-sm`} />
          <p> User </p>
        </div>
        <div className='flex gap-1 justify-center items-center'>
          <div className={`badge ${System ? 'badge-success' : 'badge-error'} badge-sm`} />
          <p> System </p>
        </div>
        <div className='flex gap-1 justify-center items-center'>
          <div className={`badge ${Security ? 'badge-success' : 'badge-error'} badge-sm`} />
          <p> Security </p>
        </div>
        <div className='flex gap-1 justify-center items-center'>
          <div className={`badge ${Software ? 'badge-success' : 'badge-error'} badge-sm`} />
          <p> Software </p>
        </div>
        <div className='flex gap-1 justify-center items-center'>
          <div className={`badge ${Sam ? 'badge-success' : 'badge-error'} badge-sm`} />
          <p> SAM </p>
        </div>
      </div>
      <div className='h-full flex justify-center items-center'>
        <p className='text-center text-base' > {props.mode} </p>
      </div>
    </footer>
  );
};

export default Footer;
