import axios from "axios";

const data = {
  "language_id": 63,
  "source_code": "console.log(\"Hello from Node\");",
  "stdin": "",
  "expected_output": "Hello from Node\n",
  "base64_encoded": false,
  "redirect_stderr_to_stdout": true
}



const token = await axios.post("https://api.jaydipsatani.com/submissions",data,{
    params: {
        base64_encoded: false,
        wait: true
    }
})

console.log(token.data)


