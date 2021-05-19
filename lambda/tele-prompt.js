!function(e,t){for(var n in t)e[n]=t[n]}(exports,function(e){var t={};function n(r){if(t[r])return t[r].exports;var a=t[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,n),a.l=!0,a.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t){e.exports=require("axios")},function(e,t){e.exports=require("firebase-admin")},function(e,t,n){"use strict";n.r(t),n.d(t,"handler",(function(){return v}));var r=n(0),a=n.n(r);function o(e){return e.response&&"Not Found"==e.response.data.description?{errorCode:1}:e.response&&"Bad Request: message to delete not found"==e.response.data.description?{errorCode:2}:e.response&&"Bad Request: message to edit not found"==e.response.data.description?{errorCode:3}:e.response&&"Bad Request: message can't be edited"==e.response.data.description?{errorCode:4}:e.response&&"Bad Request: chat_id is empty"==e.response.data.description?{errorCode:5}:e.response&&"Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message"==e.response.data.description?{errorCode:6}:e.response&&"Forbidden: bot was blocked by the user"==e.response.data.description?{errorCode:7}:{errorCode:0,errorDescription:e.response.data.description}}const i="https://api.telegram.org/bot";function s(e,t){if(!t)return e;var n=[];for(i of t)n.push(Object.values(i));n.sort((function(e,t){return e[0]==t[0]?e[1]-t[1]:e[0]-t[0]}));var r=[],a="",o="";for(var i of n){switch(i[2]){case"bold":a="<b>",o="</b>";break;case"italic":a="<i>",o="</i>";break;case"underline":a="<u>",o="</u>";break;case"code":a="<code>",o="</code>";break;case"strikethrough":a="<s>",o="</s>";break;case"text_link":a='<a href="'+i[3]+'">',o="</a>";break;default:a="",o=""}for(var s=i[0],c=i[0]+i[1],u=s,l=c,d=0;d<r.length;++d){var p=r[d];(s>p[0]||s==p[0]&&"tail"==p[2])&&(u+=p[1].length),(c>p[0]||c==p[0]&&s==r[d-1][0])&&(l+=p[1].length)}var f=e;f=e.slice(0,u)+a,f+=e.slice(u,l)+o,f+=e.slice(l),e=f,r.push([s,a,"head"]),r.push([c,o,"tail"])}return e}const c="1154717155:AAGk3h3ljwQ8ZbwFh8ScbcrlotUECtpBI1M";async function u(e){let t=e.message.text;const n=e.message.entities;n&&(t=s(t,n));e.data.split("<>");console.log(t),console.log(n),await async function(e,t,n,r){return new Promise((s,c)=>{a.a.post(i+e+"/answerCallbackQuery",{callback_query_id:t,text:n,show_alert:r}).then(e=>{console.log("Callback "+t),s(e.data)}).catch(e=>{let t=o(e);t.errorDescription="default",c(t)})})}(c,e.id,"Thank you",!1)}async function l(e){let t=function(e,t){if(!e)return"empty";e=(e=function(e){if(e)return e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}(e)).replace(/\"/g,"'"),t&&(e=s(e,t));return e}(e.text,e.entities);if(d("/start",t))await p(e.from.id,"No functionality available");else if(d("/identify",t))await p(e.chat.id,e.chat.id.toString());else if(d("/test",t)){const t=(n={function:"test",hello:123},r="Sup nothing to see here",r+=`<a href="tg://ntelebot/${JSON.stringify(n)}">​</a>`),a=function(e,t){for(var n=[],r=0,a=0;a<e.length;++a){var o=[];for(var i of e[a])o.push({text:i,callback_data:t[r]}),r+=1;n.push(o)}return{inline_keyboard:n}}([["test"]],["test"]);await p(e.from.id,t,a)}var n,r}function d(e,t){return t.indexOf(e)>=0}async function p(e,t,n={}){await async function(e,t,n,r={}){return new Promise((s,c)=>{a.a.post(i+e+"/sendMessage",{chat_id:t,text:n,parse_mode:"HTML",reply_markup:r}).then(e=>{const t=e.data.result;console.log(`Message posted (id: ${t.message_id})`),s(e.data)}).catch(e=>{c(o(e))})})}(c,e,t,n)}let f,g,b;!function(e){e.UNAPPROVED="UNAPPROVED"}(f||(f={})),function(e){e.SIGN_UP="Signing up",e.VERIFY="Verification",e.TINDER="Match Making"}(g||(g={})),function(e){e.PDPA="PDPA",e.PROGRAMMES="Adding Programmes",e.VERIFICATION="Verification",e.APPROVING="Approval"}(b||(b={}));var m=n(1),y=n.n(m);y.a.initializeApp({credential:y.a.credential.cert({projectId:"sanbox-penpal-community",privateKey:"-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCa9ui+sjEmEB0n\nXJHeko7wulTG2aNPfb3XGezL02J6G8KwBPFOrZRyoFySdD1SKciea9mMtxgrN8CQ\n62HwiSGCZN4MUUn3BweWiWCHJecwIN0d7pF09GW0inxoUIQkuCdaPOP8JYYU/2z+\nNOnsBKDfuTuMLgoyxKP9hie7KsIG4vYw+qoYrxJJ8vlvMNqKb5LGB9sx0t/DbyKz\nue4VE5VNOOPR6FmYRylP6220mgRVVMmTsNmEc8Z9NzLrivr0yi+3IQc51a10ZJqa\n8OgZqhPBj0XE5dkejjuEHJWB7v8BLF7HaeUDbhIsvVTHL/oAZyof5NcV08ZHCpEo\nlIYcgfKDAgMBAAECggEAAdhz8CV2IWJqvnfDQvfS3PoTHWUlJUK1mpSz9b94OkUP\nXgJJD2tQy8auI45f1pUpzv0w05SwpH8e+3raKT+w1vk1jccADwGV7QyIykNAzBlw\nGLWpJM/uUCagEav3zuokidYUzwFxZdme5i4iJQ3vDosJswMvWuhtnYzV90wskGFp\n16kof7TiiMMheC6UAIT4A1G7ITEk/pkT6yt2D5Dtx6AJ55oiQgnK7CwTVJn/x0in\nOv1+8VF5jKawExQGtjcrVcjFOLJqXGV3M0WCHUAFKL/hS/FNmbRBfodrmypuFGOU\njht6qSct5/LP2RwgnfYHmGFe+u6QdRz7lCNasoa35QKBgQDIOH8A7cl/X58L/7b7\nTCcD9xN8E9/JI+ims2igoiVLy9uMkVNI7tuArGpgTjQzKqMpj5hWBgasARVYoFt7\nMcfLr3ty6e26DhbMMYtYn2vGr5QScwliFYoIeDKR90ZMGJA5FoSCJ4b2hMTDWaDM\nw0assnH6AvExhO/OBSw6Nw7Y/wKBgQDGIstPq1hLCUTtfzRG25EIul/4etifpT3T\n/JXHIEeNYe/H31G1Qj/iYJgC2JiIGFk5zG0oiUbveewmyxIMZGv9DgISb9c0PYaE\niPrV6WO45GCJJgqIvpvU+4rZ26lwOJaW86G7NdNosWlNERKg0/TZIbFkb7FrC25W\niEmu03ACfQKBgQC6x0FrS2gqg7hqSB2Z5luLLmWl3SBpki8Ju9oB5+ElCUKBqlxo\ncDKiobUGrE2z4bWeIs+4iByXPtd7+vP8Q98fm09tTt6vL0+DI0Db5rRy//4BDAGX\n14ISDpcWZffVKyD3sJLinB8iP48Ssbz45745gqoi0bXRPTM8HMU6dXxLXwKBgQCM\np46lFAIt4nqoDrFRy/T9uTD/+FVnn6pwntLE9UlWOLw7q3EZt9oaHnBLNO+zTXWp\n7lFfgXR19JuMPoSlf3SZxCP8aqDfWP3xgDxxNqmwS4+sTPEVehqt65P6bFGwdLuS\nlYmumNtnaupR51jOCym6Koz/u7q7PvYpP77u+PJ/EQKBgQCFUpN44ZwP9MveVR2f\nCRAEzlDaedqDeMFbEfS9KgvmbS4zRZlL1M1UBE59/BiRRrOXzO6nA+B3g18LReU8\nrYnyBycObh65K4tFeERKpOAmcW7iftsaTmOa2aCz3QUJ/KEJ8K3tFvoZEdtaUPRp\ndLY4yfNL6urP+T0E5xL3C+rKFw==\n-----END PRIVATE KEY-----\n",clientEmail:"firebase-adminsdk-idpsj@sanbox-penpal-community.iam.gserviceaccount.com"})});const h=e=>y.a.firestore().collection(e).withConverter({toFirestore:e=>e,fromFirestore:e=>e.data()}),w={users:h("users"),tempMsgs:h("temp_msgs"),contentPage:h("content_page"),statics:h("statics"),default:y.a.firestore()};async function v(e,t){switch(e.httpMethod){case"POST":const t=JSON.parse(e.body);await async function(e){e.message?await l(e.message):e.callback_query&&await u(e.callback_query)}(t);break;case"GET":var n=await async function(){const e=await w.contentPage.doc("content_page").get();return e.exists?e.data():null}();console.log(n)}return{statusCode:200,body:"done"}}}]));