let prompt=document.querySelector('#prompt')
let submitbtn=document.querySelector('#submit')
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")





let user={
    message:null,
    file:{
        mime_type:null,
        data:null

    }
}
async function generateResponse(aiChatBox) {
  const payload = {
    message: user.message,
    file: user.file     // { mime_type, data } or { mime_type: null, data: null }
  };

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("API response:", data);

    if (data.error) {
      console.error("Gemini error:", data.error);
      aiChatBox.querySelector(".ai-chat-area").textContent =
        data.error.message || "API error";
      return;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    const aiArea = aiChatBox.querySelector(".ai-chat-area");
    aiArea.textContent = text;
  } catch (error) {
    console.log(error);
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    image.src = `img.svg`;
    image.classList.remove("choose");
    user.file = { mime_type: null, data: null };
  }
}





function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}


function handlechatResponse(message){
    user.message=message


    let html= `<img src="userimage.png" alt="" id="userImage" width="8%"> 
           <div class="user-chat-area">
           ${user.message}
${user.file.data?`<img src="data:${user.file.mime_type};base64,${user.file.data}" class="choosimg" />` : ""}

           </div>`
prompt.value=""           
let userChatBox=createChatBox(html,"user-chat-box")
chatContainer.appendChild(userChatBox)


chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})


setTimeout(()=>{
let html=`<img src="aiimage.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
            <img src="loading1.webp" alt="" class="load" width="40px">
            </div>`
    let aiChatBox=createChatBox(html,"ai-chat-box")        
    chatContainer.appendChild(aiChatBox)
    generateResponse(aiChatBox)


},600)

}
prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
        handlechatResponse(prompt.value)
    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})

imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=(e)=>{
        let base64string=e.target.result.split(",")[1];
        user.file={
        mime_type:file.type,
        data:base64string

    };
        image.src=`data:${user.file.mime_type};base64,${user.file.data}`
        image.classList.add("choose")
    };

    reader.readAsDataURL(file);
});




imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})
