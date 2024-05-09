import { useState } from 'react';
import { Form } from '@remix-run/react';
import './SearchList.css';


const SearchList = ({ items }: { items: string[] }) => {
  const [query, setQuery] = useState('');

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
};

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-list">
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
        />
        <ul>
          {filteredItems.map((item, index) => (
            <Form key={index} method="post">
              <div >
                <input type="hidden" name="_action" value={`integration.${item}`} />
                <button onClick={() => console.log(item)} className="integrationsSearch" key={index}>{item}</button>
              </div>
            </Form>
          ))}
        </ul>
    </div>
  );
};

export default SearchList;
