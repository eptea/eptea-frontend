// src/pages/CreateInstitution.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_INST_MUTATION = gql`
  mutation CreateInstitution($name: String!, $username: String!, $password: String!) {
    createInstitution(name: $name, username: $username, password: $password) {
      institution { id name }
    }
  }
`;

export default function CreateInstitution() {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [createInst] = useMutation(CREATE_INST_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInst({ variables: form });
      alert("Institution created successfully!");
    } catch (err) { alert(err.message); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>New Institution (Superuser Only)</h3>
      <input placeholder="School Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Admin Username" onChange={e => setForm({...form, username: e.target.value})} />
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <button type="submit">Create</button>
    </form>
  );
}