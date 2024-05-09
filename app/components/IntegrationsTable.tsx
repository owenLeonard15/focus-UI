import { Form } from '@remix-run/react';
import SearchList from './SearchList';
import './IntegrationsTable.css';
import { ActionFunctionArgs } from '@remix-run/node';

const integrations = [
    { name: 'Whoop', status: 'connected', active: false },
    { name: 'Oura', status: 'disconnected', active: false },
    { name: 'Strava', status: 'connected', active: false },
    { name: 'Garmin', status: 'connected',  active: false },
    { name: 'Eight Sleep', status: 'connected',  active: false },
    { name: 'Coros', status: 'disconnected', active: false },
    { name: 'Apple Health', status: 'connected',  active: false },
    { name: 'Google Fit', status: 'disconnected', active: false },
    { name: 'Samsung Health', status: 'disconnected', active: false },
    { name: 'Polar', status: 'disconnected', active: false },
    { name: 'Withings', status: 'disconnected', active: false }
];


const IntegrationBox = ({ name, status }: { name: string, status: string }) => {
    return (
        <div className="integration-box">
            <div className="logo">{name}</div>
            {status === "add" ? 
                // Form to add a new integration including search bar and live updating search results
                <SearchList items={integrations.filter(integration => !integration.active).map((integration) => integration.name)} />
             : 
                (
                <>
                    <div className={`status ${status}`}><div className='bold white'>status:&nbsp; </div>{`${status}`}</div>
                        {status === 'connected' ? <button className="modify">Modify Permissions</button> : (
                            <>
                                <button className="reconnect">Reconnect</button>
                                <button className="remove">Remove</button>
                            </>
                        )} 
                </> 
                )
            }
        </div>
    );
};

const IntegrationsTable = () => {
  return (
    <div className="integrations-container">
      <h1>INTEGRATIONS</h1>
      <div className="grid">
        {integrations.map((integration, index) => (
            integration.active && <IntegrationBox key={index} name={integration.name} status={integration.status} />
        ))}
        <IntegrationBox key={-1} name={"Add Integration"} status={"add"} />
      </div>
    </div>
  );
};

export default IntegrationsTable;
