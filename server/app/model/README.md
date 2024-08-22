<h3>Model Logic</h3>
When it comes to receiving data from a gateway, DTOs and validation pipes will be used preventing the code from processing invalid data. But when it comes to sending data to the user, we already assume that the code will return a valid response. The only possible source of error that is understandable is if data passed from the client does not match the wanted parameters, but the DTOs have that covered.

<br><h3>File Naming</h3>
<p>.input.dto : DTOs representing data being received from client
<p>.output.dto : DTOs representing data being sent to the client, they exist only if their .input.dto counterpart does too
<p>.remark.dto : DTOs representing data being sent to the client "observing" the server trough a socket

