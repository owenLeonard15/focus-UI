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
      <Form method="get" reloadDocument>
        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
        />
        <ul>
          {filteredItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Form>
    </div>
  );
};

export default SearchList;
