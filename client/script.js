document.addEventListener('DOMContentLoaded', () => {
    const leadForm = document.getElementById('leadForm');
    const leadContainer = document.getElementById('leadContainer');
    const search = document.getElementById('search');
    const pagination = document.getElementById('pagination');

    let leads = [];
    let currentPage = 1;
    const leadsPerPage = 5;
    const enableEditStatus=[];
    const statusOnChange = [];



    async function fetchLeads() {
        const response = await fetch('http://localhost:3000/leads');
        leads = await response.json();
        if(leads.length<=leadsPerPage) currentPage = 1;
        renderLeads();
    }

    async function addLead(lead) {
        const response = await fetch('http://localhost:3000/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });
        if (response.ok) {
            fetchLeads();
            window.alert('Lead Added Successfully');
        }
    }

    async function deleteLead(id) {
        const response = await fetch(`http://localhost:3000/leads/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            fetchLeads();
            window.alert('Lead data removed successfully');
        }
    }

    async function updateLead(id, lead) {
        const response = await fetch(`http://localhost:3000/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });
        if (response.ok) {
            fetchLeads();
            window.alert('Lead data updated Successfully');
        }
    }

    function renderLeads() {
        leadContainer.innerHTML = '';
        const start = (currentPage - 1) * leadsPerPage;
        const end = start + leadsPerPage;
        const paginatedLeads = leads.slice(start, end);
        paginatedLeads.forEach((lead) => {
            const leadRow = document.createElement('tr');
            leadRow.innerHTML = `
                <td>${lead.name}</td>
                <td>${lead.email}</td>
                <td>${lead.phone}</td>
                <td>
                    <select data-id="${lead.id}" class="status" ${enableEditStatus.includes(lead.id)? "enabled" : "disabled"}>
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="qualified" ${lead.status === 'qualified' ? 'selected' : ''}>Qualified</option>
                    </select>
                </td>
                <td>
                    <button class=${enableEditStatus.includes(lead.id)? "save" : "edit"} data-id="${lead.id}">${enableEditStatus.includes(lead.id)? "Save" : "Edit"}</button>
                    <button class="delete" data-id="${lead.id}">Delete</button>
                </td>
            `;
            leadContainer.appendChild(leadRow);
        });
        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(leads.length / leadsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.className = (i === currentPage) ? 'active' : '';
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderLeads();
            });
            pagination.appendChild(pageButton);
        }
    }

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const status = document.getElementById('status').value;

        if (name && email && phone) {
            addLead({ name, email, phone, status });
            leadForm.reset();
        }
    });

    leadContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete')) {
            const id = e.target.dataset.id;
            deleteLead(id);
        }
    });

    leadContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('status')) {
            const id = e.target.dataset.id;
            const status = e.target.value;
            statusOnChange.push({id, status});
        }
    });

    leadContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit')) {
            const id = e.target.dataset.id;
            enableEditStatus.push(id);
            fetchLeads();
        }

    });

    leadContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('save')) {
            const id = e.target.dataset.id;
            enableEditStatus.filter((value)=> value !== id);
            const idIndex = enableEditStatus.indexOf(id);
            enableEditStatus.splice(idIndex,1);
            const statusIndex = statusOnChange.findIndex(obj => obj.id == id);
            const statusObj = statusOnChange[statusIndex];
            const lead = leads.find(lead => lead.id === id);
            if(statusObj && lead) {
                    updateLead(id, { ...lead, status: statusObj.status });
            }
            statusOnChange.splice(statusIndex,1);
        }

    });

    search.addEventListener('input', () => {
        const query = search.value.toLowerCase();
        if(query=="") {
            fetchLeads();
        } else {

            const filteredLeads = leads.filter(lead =>
                lead.name.toLowerCase().includes(query) ||
                lead.email.toLowerCase().includes(query) ||
                lead.status.toLowerCase().includes(query)
                );
                leadContainer.innerHTML = '';
                filteredLeads.forEach(lead => {
                    const leadRow = document.createElement('tr');
                    leadRow.innerHTML = `
                    <td>${lead.name}</td>
                    <td>${lead.email}</td>
                    <td>${lead.phone}</td>
                    <td>${lead.status}</td>
                    <td>
                    <button class=${enableEditStatus.includes(lead.id)? "save" : "edit"} data-id="${lead.id}" >${enableEditStatus.includes(lead.id)? "Save" : "Edit"}</button>
                    <button class="delete" data-id="${lead.id}">Delete</button>
                    </td>
                    `;
                    leadContainer.appendChild(leadRow);
                });
            }
    });

    fetchLeads();
});
