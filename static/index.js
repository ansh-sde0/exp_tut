let get_users_btn = document.getElementById("get_users")
let add_user_btn = document.getElementById("add_user")

get_users_btn.addEventListener('click',async function(){

    try {
        const response = await fetch("http://localhost:5000/users")
        const response_data = await response.json()

        let display_container = document.getElementById("display-users");
        display_container.innerHTML = '';

        response_data.map((user)=>{

            let user_space = document.createElement('div')
        
            user_space.innerHTML = user.name
            display_container.appendChild(user_space);

            })

    } catch (error){
        console.log('Error:',error)
    }

})

add_user_btn.addEventListener('click',async function(){
  
    let name_input = document.createElement('input');
    name_input.setAttribute('type','text');
    name_input.setAttribute('placeholder','Enter name');
    document.body.appendChild(name_input);

    let email_input = document.createElement('input');
    email_input.setAttribute('type','text');
    email_input.setAttribute('placeholder','Enter email');
    document.body.appendChild(email_input);

    let create_user_btn = document.createElement('button');
    create_user_btn.innerHTML = 'Create User';
    document.body.appendChild(create_user_btn);

    create_user_btn.addEventListener('click', async function(){
        let name = name_input.value;
        let email = email_input.value;

        let data = {
            name:name,
            email:email
        }

        console.log(JSON.stringify(data))

        let response = await fetch("http://localhost:5000/user/create",{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data)
        });

        let server_response = await response.text();
        let response_div = document.createElement('div');
        response_div.innerHTML = server_response;
        document.body.appendChild(response_div);
    });

})
