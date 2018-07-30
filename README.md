# Crowdchain leverages blockchain to create distributed, enforceable contracts, making impactful changes occur.

https://crowdchain.verafy.me/

## Inspiration

Road traffic is a huge problem in LA and cities all across the world. It decreases productivity and steals otherwise fun or useful time. Although there are ways to solve this issue, such as having more people utilize buses and public transportation, these methods are not effective unless a large portion of society switches to these alternative modes of transportation all at once. We aim to solve this problem through the use of Crowdchain, which leverages the power of blockchain to create distributed, enforceable contracts and the ability of large groups of people to make change happen.

## What it does
 
The way Crowdchain functions is that once users sign up, there is no immediate commitment to change their daily commuting habits. However, when a certain percentage of LA residents, say 80%, decide to sign up behind the initiative to switch to public transportation, our smart contract kicks in. Users who have previously joined the initiative and actually switch to using buses and subways for transportation will receive an award for participating in the huge shift to public transportation. This is implemented through a mobile app that allows users to scan QR codes available on participating buses and subways, which in turn interacts with our blockchain which handles the verification and payment process, thus incentivizing users to switch to public transportation as a large group for bigger, better impact.


## How we built it

First, we worked on creating a Blockchain backend for the project, looking into options such as creating our own virtual currency, different types of servers and networks we could run our blockchain on, etc. We decided to go with ganache-cli as a test network for our currency, due to its highly controllable nature and convenience. Afterwards, we looked at technologies such as Web3 and Metamask to link our blockchain backend to users. These technologies proved to be particularly effective, as we were able to create a visually appealing website and allow users to access the cryptocurrency with convenience right in their web browser. To help notify users of when monetary rewards will be handed out (i.e., when the 80% mark has been reached), we utilized Twilio API to help spread the word, giving all participants an accessible heads up about the impending changes. Finally, we created an Android app with the capability of scanning QR codes, and we integrated this with our ethereum dapp in order to create a comprehensive system that incentivizes users to take action behind initiatives as a group for larger effect and impact.

## Challenges we ran into
We ran into several challenges over the course of the hackathon. One of our biggest challenges was integrating the blockchain backend with our website and MetaMask, a smart ethereum wallet. Also, we ran into a few problems setting up the Arduino 101 and being able to control the LED lights connected to the board. 

## Accomplishments that we're proud of
We are proud of the capabilities of Crowdchain, specifically in solving real world problems with collaboration. Further, we are proud that of overcoming obstacles, such as the integration of Blockchain and smart contracts with our frontend website, to create a polished final product that has stayed true to our original vision. 

## What we learned
Through building our project, we’ve learned more about the innerworkings of blockchain and ethereum, specifically how smart contracts play a role in transactions. We’ve also learned more about frontend (web dev), and about hardware (arduino). 
 
## What's next
Crowdchain could be applied to many other social dilemmas faced in society, such as in climate change, since all countries would benefit from stable climate, but are many are unwilling or unable to reduce CO2 emissions. Additionally, Crowdchain could be used to solve overfishing, specifically to promote fishing in non-sensitive places. Other uses include decentralized crowdfunding, meetups and events, social media petitions and callouts, and much more.
