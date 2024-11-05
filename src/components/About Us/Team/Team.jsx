/**
 * This code was generated by Builder.io
 */
import React from "react";
import TeamMember from "./TeamMember";

const teamMembers = [
  {
    name: "Rushikesh Sabale",
    position: "Product Manager, Zenitheum",
    imageSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/3c9daa528d40da73ac11f0be1111870e0d0ed5007a561aa1cd25df82f291215c?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
  },
  {
    name: "Avinash Ingle",
    position: "Chief Operating Officer, Zenitheum",
    imageSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/8f800feea8322e8d040932df66477c9875d376651b5a113e7fe6140c1eaca7d2?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
  },
  {
    name: "Nachiket Tekade",
    position: "Full-Stack Developer, Zenitheum",
    imageSrc:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/89aec8cf3804860a81a7b8283a1adabc57a8548e6c5b86b3d5be524b85aeb927?placeholderIfAbsent=true&apiKey=6996dc1fa2444cff9994ea13907adb22",
  },
];

const Team = () => {
  return (
    <section
      data-layername="ourTeam"
      className="flex relative gap-10 pr-16 pl-16 mt-32 w-full text-white border-t border-b border-zinc-700 max-md:px-5 max-md:mt-10 max-md:max-w-full"
    >
      <div
        data-layername="divWNode99Feaec272B08085F1A2Bbf1C421530E9671Bbb9"
        className="flex z-0 flex-wrap items-start h-full min-w-[240px] w-[1203px] max-md:max-w-full"
      >
        {teamMembers.map((member, index) => (
          <TeamMember key={index} {...member} />
        ))}
      </div>
      <div
        data-layername="divWNode8F724A5176B938647BdeF393B3359C9D9671Bbb9"
        className="flex z-0 flex-col justify-center my-auto min-h-[708px] min-w-[240px] w-[486px] max-md:max-w-full"
      >
        <h2
          data-layername="ourTeam"
          className="text-6xl font-medium leading-none max-md:max-w-full max-md:text-4xl"
        >
          Our Team
        </h2>
        <p
          data-layername="ourDiverseAndDynamicTeamIsTheHeartOfOurSuccessComprisingExceptionalTalentsFromVariousAreasOfExpertiseWeUniteUnderACommonVisionToDriveInnovationAndExcellenceWithDeepExpertiseInBlockchainDataEngineeringAndAiOurCollaborativeSpiritFuelsGroundbreakingSolutionsThatPropelOurClientsTowardsTheirGoalsTogetherWeAreCommittedToShapingABrighterFutureEmpoweredByTechnologyAndFosteringMeaningfulConnectionsOnAGlobalScale"
          className="mt-24 text-2xl max-md:mt-10 max-md:max-w-full"
        >
          Our diverse and dynamic team is the heart of our success. Comprising
          exceptional talents from various areas of expertise, we unite under a
          common vision to drive innovation and excellence. With deep expertise
          in Blockchain, Data Engineering, and AI, our collaborative spirit
          fuels groundbreaking solutions that propel our clients towards their
          goals. Together, we are committed to shaping a brighter future
          empowered by technology and fostering meaningful connections on a
          global scale.
        </p>
      </div>
    </section>
  );
};

export default Team;