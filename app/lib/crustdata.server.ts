import db from "./db.server";
import s3 from "./s3.server";
import {
  CrustCompanyType,
  CrustProfileResponse,
  CrustCompanyFounders,
} from "./typesCrust";
import { Resource } from "sst";
const crustdata = {
  byDomain: async (domain: string): Promise<CrustCompanyType> => {
    const headers = {
      "Content-Type": "application/json, text/plain, */*",
      Authorization: `token ${Resource.CRUSTDATA_SECRET.value}`,
    };
    console.log(headers);
    console.log(domain);
    const response = await fetch(
      `https://api.crustdata.com/screener/company?company_domain=${domain}`,
      {
        headers,
      },
    ).then((res) => res.json());
    console.log("response", response[0]);
    return response[0];
  },
  byDomainFounderInfo: async (
    domain: string,
  ): Promise<CrustProfileResponse | null> => {
    const headers = {
      "Content-Type": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Authorization: `token ${Resource.CRUSTDATA_SECRET.value}`,
    };
    console.log(headers);
    console.log(domain);
    const response = await fetch(
      `https://api.crustdata.com/screener/company?company_domain=${domain}&fields=founders.profiles`,
      {
        headers,
      },
    ).then((res) => res.json());
    console.log("response", response);
    if (response?.[0]) return response[0];
    else return null;
  },
  byDomainFoundersSafe: async (
    domain: string,
  ): Promise<CrustCompanyFounders | null> => {
    const response = await db.crustdataFounders.query(domain);
    if (response.length > 0 && response[0].data)
      return Array.isArray(response[0].data)
        ? response[0].data[0]
        : response[0].data;
    else {
      const response = await crustdata.byDomainFounderInfo(domain);
      if (!response) return null;
      const obj = {
        domain: response.company_website_domain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        company_id: response?.company_id,
        founders: response?.founders.profiles,
      };
      await db.crustdataFounders.create(obj);
      return obj;
    }
  },
  byDomainSafe: async (domain: string): Promise<CrustCompanyType> => {
    const response = await db.crustdata.query(domain);
    if (response.length > 0) {
      let lastIndex = 0;
      response.forEach((item, index) => {
        if (
          new Date(item.createdAt).getTime() >
          new Date(response[lastIndex].createdAt).getTime()
        ) {
          lastIndex = index;
        }
      });
      // if younger than a week ago, update
      if (
        new Date(response[lastIndex].createdAt).getTime() >
        new Date().getTime() - 1000 * 60 * 60 * 24 * 7
      ) {
        if (response[lastIndex].dataUrl) {
          return JSON.parse(
            (await s3.crustdata.get(response[lastIndex].dataUrl!)).toString(),
          ) as CrustCompanyType;
        } else {
          return response[lastIndex].data;
        }
      }
    }

    const newResponse = await crustdata.byDomain(domain);
    const dateString = new Date().toISOString().split("T")[0];
    const key = `${newResponse.company_website_domain}/${dateString}.json`;
    await s3.crustdata.upload(
      s3.lib.stringToAsyncIterable(JSON.stringify(newResponse)),
      key,
      "application/json",
    );
    await db.crustdata.create({
      domain: newResponse.company_website_domain,
      createdAt: new Date().toISOString(),
      dataUrl: key,
    });
    return newResponse;
  },
};

export default crustdata;

// const res: CrustProfileResponse = [
//   {
//     company_id: 631476,
//     company_name: "Sonder",
//     linkedin_profile_url: "https://www.linkedin.com/company/sonder-inc",
//     crunchbase_profile_url: "https://crunchbase.com/organization/sonderstays",
//     linkedin_id: "15179318",
//     linkedin_logo_url:
//       "https://media.licdn.com/dms/image/v2/C4D0BAQFdUrcm5S5aiw/company-logo_200_200/company-logo_200_200/0/1630516064767/sonder_inc_logo?e=1748476800&v=beta&t=hcm7Fwxt35sw9Eypr3yjqjNQVQ6x4vrDe1rWNaJtcUg",
//     company_twitter_url: "https://twitter.com/sonderstays",
//     company_website_domain: "sonder.com",
//     hq_country: "USA",
//     headquarters: "San Francisco, California, United States",
//     largest_headcount_country: "USA",
//     hq_street_address: "101 15th St,San Francisco",
//     company_website: "https://www.sonder.com",
//     year_founded: "2012-01-01",
//     fiscal_year_end: "December",
//     estimated_revenue_lower_bound_usd: 500000000,
//     estimated_revenue_higher_bound_usd: 1000000000,
//     employee_count_range: "1001-5000",
//     company_type: "Privately Held",
//     linkedin_company_description:
//       "Sonder is revolutionizing hospitality through innovative, tech-powered service and inspiring, thoughtfully designed accommodations combined into one seamlessly managed experience. Welcome to the future of hospitality. Officially launched in 2014 and headquartered in San Francisco, Sonder is making a world of better stays open to all with a variety of accommodation options — from rooms to suites and apartments — found in more than 30 cities spanning eight countries and three continents. Sonder’s innovative app empowers guests by making self-service features and 24/7 on-the-ground support just a tap away. From simple self check-in to boutique bathroom amenities, we bring the best of a hotel without any of the formality.",
//     acquisition_status: null,
//     ceo_location:
//       "Montreal, Quebec, Canada; San Francisco, California, United States; Houston, Texas, United States; Toronto, Ontario, Canada",
//     founders: {
//       profiles: [
//         {
//           linkedin_profile_url:
//             "https://www.linkedin.com/in/ACwAAAW4IUkBSt-AmhB8ORZppZLsJ98c7rou564",
//           linkedin_flagship_url:
//             "https://www.linkedin.com/in/martin-picard-5a117428",
//           name: "Martin Picard",
//           location: "Montreal, Quebec, Canada",
//           title:
//             "Co-founder & Global Head of Real Estate,Co-founder & VP Finance",
//           last_updated: "2025-02-08T18:51:13.457193+00:00",
//           headline: "Co-founder & Global Head of Real Estate at Sonder Inc.",
//           summary: null,
//           num_of_connections: 1665,
//           skills: [
//             "Financial Analysis",
//             "Financial Accounting",
//             "Financial Reporting",
//             "Business Strategy",
//             "Auditing",
//             "Entrepreneurship",
//             "IFRS",
//             "Internal Controls",
//             "Start-ups",
//             "Business Development",
//             "Corporate Finance",
//             "Advertising",
//             "Venture Capital",
//             "E-commerce",
//             "Forecasting",
//             "Cash Management",
//           ],
//           profile_picture_url:
//             "https://media.licdn.com/dms/image/v2/C5603AQHY08wlc_nAeg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1554356518590?e=1744243200&v=beta&t=ApQG6zD4GSX3cwN6UyQRGwEk-ycdKfUWJULySwJcN8o",
//           twitter_handle: "Marty_Picard",
//           languages: ["English", "French"],
//           linkedin_open_to_cards: null,
//           all_employers: [
//             "Adzura Inc.",
//             "Deloitte",
//             "Ned Davis Research",
//             "Sonder Inc.",
//             "Taiga Motors",
//           ],
//           past_employers: [
//             {
//               employer_name: "Taiga Motors",
//               employer_linkedin_id: "10220134",
//               employer_logo_url:
//                 "https://media.licdn.com/dms/image/v2/C560BAQE-ZpOIzY4uUQ/company-logo_400_400/company-logo_400_400/0/1655303641809/taiga_motors_logo?e=1747872000&v=beta&t=9QSe3TcrMpM0ux6kc-IQ1nfoRqhbvlVQMCa6Vo066h4",
//               employer_linkedin_description:
//                 "Taiga Motors is a Canadian based startup leading the electrification of off-road powersport vehicles. We believe in pure exhilaration– in vehicles that outperform everything else out there without sacrificing the environment, be it carving through powder, across lakes or along dirt trails., , At Taiga, we are uniting innovative and adventurous minds to form a team that isn't afraid to tackle the industry's toughest problems. Our approach is simple: we start from a clean sheet and push the frontiers of technology until we end up with elegant and powerful solutions., , We work fast, dream big and relentlessly chase perfection. We believe that snow days are best enjoyed outside the office and that nothing beats the summer heat like a day on the lake.",
//               employer_company_id: [664987, 780132],
//               employer_company_website_domain: [
//                 "taigamotors.com",
//                 "taigamotors.com",
//               ],
//               employee_position_id: 1842270689,
//               employee_title: "Board Member",
//               employee_description: null,
//               employee_location: "Montreal, Quebec, Canada",
//               start_date: "2021-04-01T00:00:00+00:00",
//               end_date: "2024-10-01T00:00:00+00:00",
//             },
//             {
//               employer_name: "Deloitte",
//               employer_linkedin_id: "1038",
//               employer_logo_url:
//                 "https://media.licdn.com/dms/image/v2/C560BAQGNtpblgQpJoQ/company-logo_400_400/company-logo_400_400/0/1662120928214/deloitte_logo?e=1748476800&v=beta&t=hIKTuzC_7l7C7A2Sc98ugCNLDzowluAKP5DldUmvohw",
//               employer_linkedin_description:
//                 "Deloitte drives progress. Our firms around the world help clients become leaders wherever they choose to compete. Deloitte invests in outstanding people of diverse talents and backgrounds and empowers them to achieve more than they could elsewhere. Our work combines advice with action and integrity. We believe that when our clients and society are stronger, so are we. , , Deloitte refers to one or more of Deloitte Touche Tohmatsu Limited (“DTTL”), its global network of member firms, and their related entities. DTTL (also referred to as “Deloitte Global”) and each of its member firms are legally separate and independent entities. DTTL does not provide services to clients. Please see www.deloitte.com/about to learn more., , The content on this page contains general information only, and none of Deloitte Touche Tohmatsu Limited, its member firms, or their related entities (collectively the “Deloitte Network”) is, by means of this publication, rendering professional advice or services. Before making any decision or taking any action that may affect your finances or your business, you should consult a qualified professional adviser. No entity in the Deloitte Network shall be responsible for any loss whatsoever sustained by any person who relies on content from this page.",
//               employer_company_id: [1119869],
//               employer_company_website_domain: ["deloitte.com"],
//               employee_position_id: 153344051,
//               employee_title: "Senior Financial Auditor",
//               employee_description: null,
//               employee_location: "Montreal, Canada Area",
//               start_date: "2007-04-01T00:00:00+00:00",
//               end_date: "2012-02-01T00:00:00+00:00",
//             },
//             {
//               employer_name: "Sonder Inc.",
//               employer_linkedin_id: "15179318",
//               employer_logo_url:
//                 "https://media.licdn.com/dms/image/v2/C4D0BAQFdUrcm5S5aiw/company-logo_400_400/company-logo_400_400/0/1630516064767/sonder_inc_logo?e=1748476800&v=beta&t=uvZ9zl_C55mnUc23udSTcdpJ1FQ4p6ClgKJfQN7e3Rs",
//               employer_linkedin_description:
//                 "Sonder is revolutionizing hospitality through innovative, tech-powered service and inspiring, thoughtfully designed accommodations combined into one seamlessly managed experience. Welcome to the future of hospitality., , Officially launched in 2014 and headquartered in San Francisco, Sonder is making a world of better stays open to all with a variety of accommodation options — from rooms to suites and apartments — found in more than 30 cities spanning eight countries and three continents. , , Sonder’s innovative app empowers guests by making self-service features and 24/7 on-the-ground support just a tap away. From simple self check-in to boutique bathroom amenities, we bring the best of a hotel without any of the formality.",
//               employer_company_id: [631476],
//               employer_company_website_domain: ["sonder.com"],
//               employee_position_id: 674010285,
//               employee_title: "Co-founder & VP Finance",
//               employee_description: null,
//               employee_location: "San Francisco Bay Area",
//               start_date: "2015-05-01T00:00:00+00:00",
//               end_date: "2019-02-01T00:00:00+00:00",
//             },
//             {
//               employer_name: "Ned Davis Research",
//               employer_linkedin_id: "233964",
//               employer_logo_url:
//                 "https://media.licdn.com/dms/image/v2/C560BAQFUpW0Qru_z0g/company-logo_400_400/company-logo_400_400/0/1657136671907/ned_davis_research_inc_logo?e=1748476800&v=beta&t=23A_tuS8JaDAuA9mq7WHe1tjyj3rTJrTMRwGlEuSAKQ",
//               employer_linkedin_description:
//                 "Founded in 1980, Ned Davis Research Group is an independent investment research firm with over 1,100 institutional clients in over three dozen countries. With a range of products and services utilizing a 360 degree methodology, we deliver award-winning solutions to the world's leading investment management companies. Our clients include professionals from global investment firms, banks, insurance companies, mutual funds, hedge funds, pension and endowment funds, and registered investment advisors., , At Ned Davis Research, we believe that successful investing is grounded in having the right perspectives. Generating alpha requires identifying potential upside as well as possible pitfalls. To do this, you need a clear view of the whole investment picture., , Actionable ideas meet balanced, strategic insights through our 360 degree research methodology. Our approach offers a more complete investment picture by combining both fundamental and technical research. Fundamentals tell us how markets should be acting while technical reveal how markets are acting. Truly insightful and timely ideas demand a balance between the two disciplines.",
//               employer_company_id: [1305341],
//               employer_company_website_domain: ["ndr.com"],
//               employee_position_id: 266523700,
//               employee_title: "Finance Manager",
//               employee_description: null,
//               employee_location: "Montreal, QC, Boston, MA & Sarasota, FL",
//               start_date: "2012-02-01T00:00:00+00:00",
//               end_date: "2014-02-01T00:00:00+00:00",
//             },
//             {
//               employer_name: "Adzura Inc.",
//               employer_linkedin_id: "5022756",
//               employer_logo_url: null,
//               employer_linkedin_description: null,
//               employer_company_id: [],
//               employer_company_website_domain: [],
//               employee_position_id: 526710937,
//               employee_title: "Co-founder & CEO",
//               employee_description: null,
//               employee_location: "Montreal, Canada Area",
//               start_date: "2013-09-01T00:00:00+00:00",
//               end_date: "2015-03-01T00:00:00+00:00",
//             },
//           ],
//           current_employers: [
//             {
//               employer_name: "Sonder Inc.",
//               employer_linkedin_id: "15179318",
//               employer_logo_url:
//                 "https://media.licdn.com/dms/image/v2/C4D0BAQFdUrcm5S5aiw/company-logo_400_400/company-logo_400_400/0/1630516064767/sonder_inc_logo?e=1748476800&v=beta&t=uvZ9zl_C55mnUc23udSTcdpJ1FQ4p6ClgKJfQN7e3Rs",
//               employer_linkedin_description:
//                 "Sonder is revolutionizing hospitality through innovative, tech-powered service and inspiring, thoughtfully designed accommodations combined into one seamlessly managed experience. Welcome to the future of hospitality., , Officially launched in 2014 and headquartered in San Francisco, Sonder is making a world of better stays open to all with a variety of accommodation options — from rooms to suites and apartments — found in more than 30 cities spanning eight countries and three continents. , , Sonder’s innovative app empowers guests by making self-service features and 24/7 on-the-ground support just a tap away. From simple self check-in to boutique bathroom amenities, we bring the best of a hotel without any of the formality.",
//               employer_company_id: [631476],
//               employer_company_website_domain: ["sonder.com"],
//               employee_position_id: 1426326952,
//               employee_title: "Co-founder & Global Head of Real Estate",
//               employee_description: null,
//               employee_location: "San Francisco Bay Area",
//               start_date: "2019-02-01T00:00:00+00:00",
//               end_date: null,
//             },
//           ],
//           education_background: [
//             {
//               degree_name: "B.Comm",
//               institute_name: "Concordia University",
//               institute_linkedin_id: "163191",
//               institute_linkedin_url: "https://www.linkedin.com/school/163191/",
//               institute_logo_url:
//                 "https://media.licdn.com/dms/image/v2/D4E0BAQGYfVVygRuGfQ/company-logo_400_400/company-logo_400_400/0/1719257371250/concordia_university_logo?e=1748476800&v=beta&t=3McEqkUgGDsxQWEp-poRnh3Psy2PuUl1EiqWlHA19og",
//               field_of_study: "Accounting",
//               activities_and_societies: null,
//               start_date: "2005-01-01T00:00:00+00:00",
//               end_date: "2008-01-01T00:00:00+00:00",
//             },
//             {
//               degree_name: "Graduate Diploma of Chartered Accountancy",
//               institute_name: "Concordia University",
//               institute_linkedin_id: "163191",
//               institute_linkedin_url: "https://www.linkedin.com/school/163191/",
//               institute_logo_url:
//                 "https://media.licdn.com/dms/image/v2/D4E0BAQGYfVVygRuGfQ/company-logo_400_400/company-logo_400_400/0/1719257371250/concordia_university_logo?e=1748476800&v=beta&t=3McEqkUgGDsxQWEp-poRnh3Psy2PuUl1EiqWlHA19og",
//               field_of_study: "Chartered Accountancy Diploma",
//               activities_and_societies: null,
//               start_date: "2008-01-01T00:00:00+00:00",
//               end_date: "2010-01-01T00:00:00+00:00",
//             },
//           ],
//           certifications: null,
//           honors: null,
//           all_employers_company_id: [
//             664987, 780132, 1119869, 631476, 631476, 1305341,
//           ],
//           all_titles: [
//             "Board Member",
//             "Co-founder & CEO",
//             "Co-founder & Global Head of Real Estate",
//             "Co-founder & VP Finance",
//             "Finance Manager",
//             "Senior Financial Auditor",
//           ],
//           all_schools: ["Concordia University"],
//           all_degrees: ["B.Comm", "Graduate Diploma of Chartered Accountancy"],
//         },
//       ],
//     },
//     is_full_domain_match: true,
//   },
// ];

// curl --location 'https://api.crustdata.com/screener/company?company_domain=gotobeat.com&fields=founders.profiles' \
// --header 'Accept: application/json, text/plain, /' \
// --header 'Accept-Language: en-US,en;q=0.9' \
// --header 'Authorization: Token 29c753c08e4717288311182c22fefdb68f231e6f'
