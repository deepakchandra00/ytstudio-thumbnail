const axios = require('axios');

// Instead of:
// request.get(url, options)

// Use:
axios.get(url, options)
  .then(response => response.data)
  .catch(error => {
    throw error;
  });

// Instead of:
// request.post(url, { form: data })

// Use:
const FormData = require('form-data');
const form = new FormData();
Object.entries(data).forEach(([key, value]) => {
  form.append(key, value);
});

axios.post(url, form, {
  headers: form.getHeaders()
})
  .then(response => response.data)
  .catch(error => {
    throw error;
  }); 