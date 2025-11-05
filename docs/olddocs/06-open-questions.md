# Open Questions for Product Decisions

Brand & Assets
- Confirm final logo file format and size. Should we render logo in navbar and auth pages?
 yes in home we can put that logo in left of unityboard tect and in other ppages like login auth pop ups simly so that logo and here size could be big as it contains both name and logo but in navbar only logo to be visvle as text is already there make sure ervery css in there respective file easy for u to access ad change 

Invitations & Membership
- Should invites be single-use or allow multiple uses by default? Default expiry (e.g., 7 days)?
yes sounds good
- Roles needed beyond owner/admin/member (viewer?)
yes viewr means a person who can explore page withou login and explore open projects open projects means peolple who have created open projects loking for members thorught out the world so viewrs can see those projects and click to join but not without complete the auth part  there were the public projects direct join priveate projects will needing invitaion code or link from owner  and other admin is ol u can add from side who basically  admins work is a seprate page that will show all users and activity kind of buiness management page main focuus currently is other three roles admin can be build letter as ur wish just not to make a burden on u 
- Can members invite others (with constraints)?
i guess so u can put some constraint when owner is creating the project there can be some setting like allow members to invite and similar importent settings that will be best i guess all setting at one place u can think of more use secure things which will be direclty setted bu owner dureing cretion like project should be private or public everything 

Tasks & Workflow
- Columns: todo, in-progress, done are present. Need custom statuses or swimlanes later?
i dont know much about this u can do whatever sits best u have just thout of adding and ai helper somehere in corener or top like an ai bot whith cohere ai which help usuers to get info baout ther project and task there only without switiching to another application u know kind of accesebility easily 
- Do tasks require assignees and due dates in MVP UI?
i guess so it can be member wise or chooseing i havent imagined anything u can do what u can do best not too complex just it should have any logical flaw 

Resources
- Allowed file types and max size? Current limit is controlled by backend body size. yes there should be some size as small as we can show they use compressed size or my cloudinary will be filled 
- Should we support folders/tags?
yes ok to me 

AI Helper (Cohere)
- Scope of global helper: Q&A, task suggestions, or meeting notes? Priority for MVP?
yes as i said above it will an helper in evrything 
- What context should it automatically use (current project tasks/resources)?
that will be great 
- Any compliance constraints for sending data to Cohere?
not anything i think off

Other Modules
- Learning tracker fields (links, completion status)?
yes ok 
- Smart snippets and solution DB data shapes?
didnt gett it it just a saveing of notes kinf of things snippets like i created one more mongodb connection i save d it now any other mameber can copy and paste it in there project or get explanation by cohere ai help
- Discussion room: basic threads or real-time chat?
i rally dont have knowledege about chat it will jjust meeting room chat meeting room i know just this u can do what is easy without much complexity 

Deployment
- Preferred cloud (for Atlas/Cloudinary keys). Any CI/CD preference?
that is the future part i know about versal for frontend and render for bakend will se it letter 
