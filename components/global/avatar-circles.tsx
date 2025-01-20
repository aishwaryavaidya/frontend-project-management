"use client";
import React from "react";
import { AnimatedTooltip } from "../ui/animated-tooltip";
const people = [
  {
    id: 1,
    name: "Srichandan Sahu",
    designation: "Delivery Head",
    image:
      "https://media.licdn.com/dms/image/v2/C4E03AQFGRZpqdtkrcg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1517752577598?e=1742428800&v=beta&t=oRyhncUv3aOvTpo9gVEqiQRsdzoFRaEA2gbisMQT_b0",
  },
  {
    id: 2,
    name: "Alok Pandey",
    designation: "Head-CIT",
    image:
      "https://media.licdn.com/dms/image/v2/C5603AQFHUdgcgcvIuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516554068058?e=1742428800&v=beta&t=IO0dLkg2JTDmO6A0xtC-_tfCuqj0Ob_EB5_6DKxGWDo",
  },
  {
    id: 3,
    name: "Prasad Purav",
    designation: "Head-COE",
    image:
      "https://media.licdn.com/dms/image/v2/C5103AQFiihKehz4zuw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1566543700537?e=1742428800&v=beta&t=OwiENIngwFNp_4at-p-BJ8lzgnX-Yl3rRcJ-jn7JG2s",
  },
  {
    id: 4,
    name: "Aishwarya Vaidya",
    designation: "Business Analyst",
    image:
      "https://media.licdn.com/dms/image/v2/C4E03AQGvfjQHhIo0dA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1601275385356?e=1742428800&v=beta&t=p3NxeGoWnQ_k7RqWN0a_D-VPaPeSF74So7kPjw0VxKA",
  },
  {
    id: 5,
    name: "Saurabh Naik",
    designation: "Solution Architect",
    image:
      "https://media.licdn.com/dms/image/v2/C5603AQE-mV9R7UMQWg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517640561994?e=1742428800&v=beta&t=4Cgbv5q2NRhg5E25iANRvQ7qCfxFA417x_2a5olQzdw",
  },
  {
    id: 6,
    name: "Viswajeet Ray",
    designation: "GET",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQH2_yXrMOdAjQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1695228548714?e=1742428800&v=beta&t=VBrnTVQ1z1eiUFpNAucqHTc9WB2JHAwyr62TRf0rOp0",
  },
  {
    id: 7,
    name: "Diptesh Nemade",
    designation: "FC",
    image:
      "https://media.licdn.com/dms/image/v2/C4E03AQHbI_Vu_TGDYQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1659249940071?e=1742428800&v=beta&t=1Nzb946fwyEIOydFtwqIRMoDP2-BAqhsbQSe3BAz1s0",
  },
  {
    id: 8,
    name: "Satyabrata Pattnaik",
    designation: "GET",
    image:
      "https://media.licdn.com/dms/image/v2/C5603AQGPdqh-S-ezFA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1611389086519?e=1742428800&v=beta&t=pOq0PtpqUwgvhXqD9-s4P8E0_Q96BcmgR1i0x9O9DfM",
  },
];

export function AnimatedAvatars() {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      <AnimatedTooltip items={people} />
    </div>
  );
}
