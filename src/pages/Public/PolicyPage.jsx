import { useLocation } from "react-router-dom";
import { useEffect } from "react";
// import React from "react";
import { motion } from "framer-motion";


const PolicyPage = ({ policyType }) => {
  const location = useLocation();

  useEffect(() => {
    setTimeout(() => {
      if (location.hash) {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }, 10);
  }, [location]);



  const policies = {

    "About Us": {
      title: "About ANIRBAN'S ACADEMY",
      content: [
        {
          heading: "Our Mission",
          text: "To empower students with knowledge, skills, and confidence to excel in competitive exams and achieve their career goals. We are committed to providing high-quality education through innovative teaching methodologies and comprehensive study materials."
        },
        {
          heading: "Our Vision",
          text: "To be the most trusted educational platform that transforms the learning experience and creates a positive impact on students' lives. We aim to foster a learning environment that encourages critical thinking, creativity, and continuous improvement."
        },
        {
          heading: "Our Values",
          list: [
            "Excellence: We strive for excellence in everything we do, from course content to student support.",
            "Innovation: We continuously innovate to enhance the learning experience and adapt to evolving educational needs.",
            "Integrity: We maintain the highest standards of integrity and ethics in all our interactions.",
            "Student-Centric: Our students are at the center of everything we do. Their success is our success."
          ]
        }
      ]
    },



    "Terms & Conditions": {
      title: "Terms & Conditions",
      content: [
        {
          text: (
            <>
              <div style={{ textAlign: 'center' }} >
                <span style={{ color: '#b3b613', fontWeight: 'bold', fontSize: '35px' }}>INTRODUCTION</span>
              </div>
              <p className="scroll-mt-24">
                If you access our app ANIRBAN’s ACADEMY and/or website www.anirbansacademy.com (hereinafter referred to as “Website” or “App” or “ANIRBAN’s ACADEMY”) You agree to be bound by the provisions of these Terms of Use. The domain name, Website and the App is owned, registered and operated by “ANIRBAN’s ACADEMY”.
                Hereinafter referred to as “we” or “us” or “our” or “Company” or “ANIRBAN’s ACADEMY”. These Terms of Use, are between ANIRBAN’s ACADEMY, and the User(s), who are registered or with us, or those who use ANIRBAN’s ACADEMY as unregistered users (hereinafter referred to as “You” or “Your” or “User(s)”).
                Please read these Terms of Use as they shall govern your use of ANIRBAN’s ACADEMY. By using or visiting including but not limited to Website, App or any products, software, information, data feeds, materials or services provided to you on, from, or through ANIRBAN’s ACADEMY (collectively the “Platform”) you signify your agreement to (1) these “Terms of Use”, (2) our Privacy Policy available on the Website and app and (3) any other terms, guidelines, rules, additional terms of service, or other disclaimer & notices if any ("Additional Terms"). If you do not agree to any of these term please do not use the Platform.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>ANIRBAN’s ACADEMY PLATFORM</span>

              </div><p>
                1.	These Terms and Conditions apply to all Users of the ANIRBAN’s ACADEMY Platform. The ANIRBAN’s ACADEMY Platform includes all aspects of the Website and Apps which includes but is not limited to products, software, and service offered via the ANIRBAN’s ACADEMY Platform, such as the ANIRBAN’s ACADEMY website and ANIRBAN’s ACADEMY app, and any other service or application that ANIRBAN’s ACADEMY introduces from time to time.
                <br />
                2.	 ANIRBAN’s ACADEMY Platform is an online platform that provides educational videos/or tutorials, by the ANIRBAN’s ACADEMY faculties of the ANIRBAN’s ACADEMY Platform and acts as an intermediary between the educator and the faculty. Content uploaded through the use of the ANIRBAN’s ACADEMY Platform shall hereinafter be referred to as “ANIRBAN’s ACADEMY Content”. You agree and acknowledge that ANIRBAN’s ACADEMY has complete control over and assumes responsibility for, the ANIRBAN’s ACADEMY Content.
                <br />
                3.	Subject to these Terms and Conditions, Privacy Policy, and all other rules and policies made available or published elsewhere, ANIRBAN’s ACADEMY hereby grants you a non-exclusive, non-transferable, non-sublicensable, limited license to use the ANIRBAN’s ACADEMY Platform in accordance with these Terms and Conditions.
                <br />
                4.	You agree and acknowledge that ANIRBAN’s ACADEMY shall have the right at any time to change or discontinue any aspect or feature of the ANIRBAN’s ACADEMY Platform, including, but not limited to, the ANIRBAN’s ACADEMY Content, hours of availability, and equipment needed for access or use. Further, ANIRBAN’s ACADEMY may discontinue disseminating any portion of information or category of information that may change or eliminate any transmission method and may change transmission speeds or other signal characteristics. ANIRBAN’s ACADEMY reserves the right to refuse access to the ANIRBAN’s ACADEMY Platform, terminate Accounts, remove or edit contents without any notice to You.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>ACCOUNTS/ REGISTRATION</span>

              </div><p>
                ANIRBAN’s ACADEMY requires you to register as a User by creating an Account in order to use all the features provided for in the Platform, you may have to create your account with ANIRBAN’s ACADEMY. You agree and confirm that you will never use another User’s account nor provide access to your account to any third party. When creating your account, you confirm that the information so provided is accurate and complete. Further, you agree that you are solely responsible for the activities that occur on your account, and you shall keep your account password secure and not share the same with anyone. You must notify ANIRBAN’s ACADEMY immediately of any breach of security or unauthorized use of your account. At no point in time will ANIRBAN’s ACADEMY be liable for any losses caused by any unauthorized use of your account, you shall solely be liable for the losses caused to ANIRBAN’s ACADEMY or others due to such unauthorized use if any. ANIRBAN’s ACADEMY takes full responsibility for all ANIRBAN’s ACADEMY Content that is uploaded on the ANIRBAN’s ACADEMY Platform, and further, ANIRBAN’s ACADEMY shall be responsible for teacher’s actions in utilizing such ANIRBAN’s ACADEMY Content and availing the ANIRBAN’s ACADEMY Platform provided herein.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>What all you need for glitch-free experience?</span>
              </div><p>
                A stable internet connection with speed on 2.0 MBPS or above. Wi-fi is preferable, however stable 4G connections perform equally good. In case the internet connectivity is not stable or fast enough there can be some glitches in the performance of videos. Institute shall not be responsible for the glitches that are due to your internet connectivity.
                Videos cannot be downloaded from the portal and in App.
                Video doesn't work in any Ios device.
                Also, please make sure your android version is above 10 so that you can have smooth experience.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>ACCESS, PERMISSIONS and RESTRICTIONS</span>

              </div><p>
                ANIRBAN’s ACADEMY hereby grants you permission to access and use the ANIRBAN’s ACADEMY Platform as set forth in these Terms   and Conditions, provided that:
                <br />
                •	 You agree not to recreate, distribute, modify, in any medium any part of the ANIRBAN’s ACADEMY Platform or the content without our prior written authorization.
                <br />
                •	 You agree not to access the content of any other User through any technology or means other than the video playback pages of the ANIRBAN’s ACADEMY Platform itself.
                <br />
                •	You agree not to use ANIRBAN’s ACADEMY Platform for any of the following commercial uses unless you obtain our prior written approval.
                <br />
                	The sale of access advertising, sponsorships, or promotions placed on or within the ANIRBAN’s ACADEMY Platform or content.
                <br />
                	 The sale of advertising, sponsorships, or promotions on any page or website that provides a similar ANIRBAN’s ACADEMY Platform as that of ANIRBAN’s ACADEMY.
                <br />
                •	 You agree to receive installs and updates from time to time from ANIRBAN’s ACADEMY. These updates are designed to improve, enhance and further develop the ANIRBAN’s ACADEMY Platform and may take the form of bug fixes, enhanced functions, new software modules, and completely new versions for better user experience. You agree to receive such updates (and permit ANIRBAN’s ACADEMY to deliver these to you) as part of your use of the ANIRBAN’s ACADEMY Platform.
                <br />
                •	 You agree not to use or launch any automated system, including without limitation, “robots,” “spiders,” or “offline readers,” that accesses the ANIRBAN’s ACADEMY Platform in a manner that sends more request messages to ANIRBAN’s ACADEMY servers in a given period of time than a human can reasonably produce in the same period by using a conventional on-line web browser. Notwithstanding the foregoing, ANIRBAN’s ACADEMY grants the operators of public search engines permission to use spiders to copy materials from the site for the sole purpose of and solely to the extent necessary for creating publicly available searchable indices of the materials, but not caches or archives of such materials. ANIRBAN’s ACADEMY reserves the right to revoke these exceptions either generally or in specific cases at any time with or without providing any notice in this regard. You agree not to collect or harvest any personally identifiable information, including account names, from the ANIRBAN’s ACADEMY Platform, nor to use the communication systems provided by the ANIRBAN’s ACADEMY Platform (e.g., comments, email) for any commercial solicitation purposes. You agree not to solicit, for commercial purposes, any Users of the ANIRBAN’s ACADEMY Platform with respect to ANIRBAN’s ACADEMY content.
                <br />
                •	 You may post reviews, comments, doubts and other content; send other communications; and submit suggestions, ideas, comments, questions, or other information as long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, infringement of intellectual property rights, or otherwise injurious to third parties or objectionable and does not consist of or contain software viruses, political campaigning, commercial solicitation, chain letters, mass mailings or any other form of spam. Further, teachers give ANIRBAN’s ACADEMY a limited, royalty-free, worldwide, exclusive license to use the ANIRBAN’s ACADEMY Content and communication in developing its ANIRBAN’s ACADEMY Platform and in any of its marketing or promotional activities.
                <br />
                •	 In your use of the ANIRBAN’s ACADEMY Platform, you will at all times comply with all applicable laws and regulations.
                <br />
                •	ANIRBAN’s ACADEMY reserves the right to discontinue any aspect of the ANIRBAN’s ACADEMY Platform at any time with or without notice at its sole discretion.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>USE OF CONTENT</span>

              </div><p>
                In addition to the general restrictions mentioned above, the following limitation and conditions shall apply to your use of the Content.
                <br />
                	 ANIRBAN’s ACADEMY Content utilized on the ANIRBAN’s ACADEMY Platform which shall include but not be limited to trademarks, service marks, and logos (“Marks”), icons, processes, images, text, software, graphics, User interfaces or UI design, visual interfaces, sounds and music (if any), artwork, database, application source code are owned by or licensed to ANIRBAN’s ACADEMY and subject to copyright and other intellectual property rights under the law.
                <br />
                	 ANIRBAN’s ACADEMY Content is provided to you on an AS-IS basis. You may access Content for your information and personal use solely as intended through the provided functionality on the ANIRBAN’s ACADEMY Platform and as permitted under these Terms and Conditions. You shall not download any ANIRBAN’s ACADEMY Content unless you see a “download” or similar link displayed by ANIRBAN’s ACADEMY on the ANIRBAN’s ACADEMY Platform for that ANIRBAN’s ACADEMY Content. You shall not copy, reproduce, make available online or electronically transmit, publish, adapt, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any ANIRBAN’s ACADEMY Content for any other purposes other than as provided herein without the prior written consent of ANIRBAN’s ACADEMY or the respective licensors of the ANIRBAN’s ACADEMY Content. ANIRBAN’s ACADEMY and its licensors reserve all rights not expressly granted in and to the ANIRBAN’s ACADEMY Platform and the ANIRBAN’s ACADEMY Content.
                <br />
                	 You agree not to circumvent, disable or otherwise interfere with security-related features of the ANIRBAN’s ACADEMY Platform or features that prevent or restrict use or copying of any ANIRBAN’s ACADEMY Content or enforce limitations on use of the ANIRBAN’s ACADEMY Platform or the ANIRBAN’s ACADEMY Content therein.
                <br />
                	You understand that when using the ANIRBAN’s ACADEMY Platform, you will learn from the best faculties and that ANIRBAN’s ACADEMY is responsible for the accuracy, usefulness, safety, or intellectual property rights of or relating to such ANIRBAN’s ACADEMY Content.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>INTELLECTUAL PROPERTY RIGHT OF ANIRBAN’s ACADEMY</span>

              </div><p>
                The ANIRBAN’s ACADEMY Platform, the processes, and their selection and arrangement, including but not limited to all text, logo or device mark, design, icons, graphics, User interfaces or UI design, visual interfaces, sounds and music (if any), artwork, source code and database on the ANIRBAN’s ACADEMY Platform is owned and controlled by ANIRBAN’s ACADEMY and  all such content mentioned hereinabove is protected by copyright, patent and trademark laws, and various other national and international IPR laws and regulations.
                Unless otherwise indicated or anything contained to the contrary, or any proprietary material owned by a third-party and so expressly mentioned, ANIRBAN’s ACADEMY owns all IPR to and into the trademark “ANIRBAN’s ACADEMY”, and “ANIRBAN’s ACADEMY App”
                The mark “ANIRBAN’s ACADEMY” is the sole property of ANIRBAN’s ACADEMY. Reproduction in whole or in any part of the same is strictly prohibited unless used with express written permission from ANIRBAN’s ACADEMY.
                So if anyone copy our text, logo or device mark, design, icons, graphics, User interfaces or UI design, visual interfaces, sounds and music (if any), artwork, database , application source code or modify things to make any clone or try to extract video links via any third party application like application cloner, ssl data capture or any other third party software to record or download our content then legal action will be taken.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>TERMINATION OF USER(S) ACCOUNT</span>

              </div><p>
                ANIRBAN’s ACADEMY will terminate User(s) access to the ANIRBAN’s ACADEMY Platform, if
                1.	 The User is a repeat copyright infringer.
                2.	The Users breaches any terms of these Terms and Conditions.
                3.	Violation of any applicable laws.
                4.	 You have behaved in a way, which objectively could be regarded as inappropriate or unlawful or illegal or which would bring any claims against ANIRBAN’s ACADEMY.
                5.	 Your use of the ANIRBAN’s ACADEMY Platform disrupts our business operations or affects any other party/ User.
                6.	 ANIRBAN’s ACADEMY reserves the right to decide whether our Content violates these Terms and Conditions for reasons other than copyright infringement, such as but not limited to, pornography, obscenity, or excessive length, or any other parameter that ANIRBAN’s ACADEMY deems fit from time to time. ANIRBAN’s ACADEMY may at any time, without prior notice and in its sole discretion, remove such ANIRBAN’s ACADEMY content and/or terminate a User's account for submitting such material in violation of these Terms and Conditions.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>PROTECTION OF USER (S) ACCOUNT</span>

              </div><p>
                We may suspend access to the ANIRBAN’s ACADEMY Platforms or require You to change Your password if we reasonably believe that the ANIRBAN’s ACADEMY Platforms have been or are likely to be misused or hacked, and we will notify You accordingly. Any termination of Your registration and/or Account or the ANIRBAN’s ACADEMY Platforms will not affect liability previously incurred by You.
                If you want to terminate your agreement with us, you may do so by (i) not accessing the Website; or (ii) deleting your Account from the Platform that you use by writing to us at info@anirbansacademy.com
              </p>

              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>Sharing your personal information</span>

              </div><p>
                We do not share, sell, trade, or rent users personal identification information to others. such as              phone number, email id, password, otp, and other information that user(s) provided us at the time of registration to ANIRBAN’s ACADEMY platform. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates and advertisers.
                But We may share your information with payment service providers, regulatory authorities, and third-party agencies in the event of any request from such authorities.
                We may disclose Your personal information if required to do so by law or in the good faith and belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or other legal process. We may disclose personal information to law enforcement offices, third party rights owners, or others in the good faith belief that such disclosure is reasonably necessary to enforce our Terms or Privacy Policy;
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>CONFIDENTIALITY</span>

              </div><p>
                You will not without obtaining the prior written consent of ANIRBAN’s ACADEMY, disclose to a third party any Confidential Information (as defined below) that is disclosed to you during the term of your use of the ANIRBAN’s ACADEMY Platform.
                For the purpose of this clause, Confidential Information shall include but shall not be limited to employee details, User list, business model, processes, ideas, concepts etc. relating to ANIRBAN’s ACADEMY or ANIRBAN’s ACADEMY Platform which are not available in the public domain. You acknowledge and agree that the Confidential Information so provided to you shall at all time be the property of ANIRBAN’s ACADEMY and any breach of the same shall cause irreparable damage to us.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>DISCLAIMER</span>

              </div><p>
                YOU AGREE THAT YOUR USE OF THE ANIRBAN’s ACADEMY PLATFORM SHALL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, ANIRBAN’s ACADEMY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS EXCLUDE ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE ANIRBAN’s ACADEMY PLATFORM AND YOUR USE THEREOF. TO THE FULLEST EXTENT PERMITTED BY LAW, ANIRBAN’s ACADEMY EXCLUDES ALL WARRANTIES, CONDITIONS, TERMS OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE ANIRBAN’s ACADEMY CONTENT OR THE CONTENT OF ANY SITES SO LINKED AND ASSUMES NO LIABILITY OR RESPONSIBILITY FOR ANY (I) ERRORS, MISTAKES, OR INACCURACIES OF ANIRBAN’s ACADEMY content OR ANY CONTENT ON ANIRBAN’s ACADEMY, (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE ANIRBAN’s ACADEMY PLATFORM, (III) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (IV) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE ANIRBAN’s ACADEMY PLATFORM, (IV) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE ANIRBAN’s ACADEMY PLATFORM BY ANY THIRD PARTY, AND/OR (V) ANY ERRORS OR OMISSIONS IN ANY ANIRBAN’s ACADEMY content OR ANY OTHER CONTENT OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY ANIRBAN’s ACADEMY content OR ANY OTHER CONTENT THAT IS POSTED, EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE ANIRBAN’s ACADEMY PLATFORM. ANIRBAN’s ACADEMY DOES NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY ANIRBAN’s ACADEMY content OR ANIRBAN’s ACADEMY PLATFORM ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE ANIRBAN’s ACADEMY PLATFORM OR ANY HYPERLINKED SERVICES OR FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND ANIRBAN’s ACADEMY WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND THIRD-PARTY PROVIDERS OF ANIRBAN’s ACADEMY content OR SERVICES. AS WITH THE PURCHASE OF A SUBSCRIPTION OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>LIMITATION OF LIABILITY</span>

              </div><p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL ANIRBAN’s ACADEMY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, LOSSES OR EXPENSES OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY (I) ERRORS, MISTAKES, OR INACCURACIES OF ANIRBAN’s ACADEMY content OR ANY OTHER CONTENT AVAILABLE AT ANIRBAN’s ACADEMY, (II) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF OUR ANIRBAN’s ACADEMY PLATFORMS, (III) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (IV) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE ANIRBAN’s ACADEMY PLATFORM, (IV) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE, WHICH MAY BE TRANSMITTED TO OR THROUGH OUR ANIRBAN’s ACADEMY PLATFORMS BY ANY THIRD PARTY, AND/OR (V) ANY ERRORS OR OMISSIONS IN ANY ANIRBAN’s ACADEMY CONTENT OR ANY OTHER CONTENT OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF YOUR USE OF ANY CONTENT POSTED, EMAILED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE ANIRBAN’s ACADEMY PLATFORM, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT ANIRBAN’s ACADEMY IS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

                WE UNDERSTAND THAT, IN SOME JURISDICTIONS, WARRANTIES, DISCLAIMERS AND CONDITIONS MAY APPLY THAT CANNOT BE LEGALLY EXCLUDED, IF THAT IS TRUE IN YOUR JURISDICTION, THEN TO THE EXTENT PERMITTED BY LAW, ANIRBAN’s ACADEMY LIMITS ITS LIABILITY FOR ANY CLAIMS UNDER THOSE WARRANTIES OR CONDITIONS TO EITHER SUPPLYING YOU THE ANIRBAN’s ACADEMY PLATFORMS AGAIN.
                YOU SPECIFICALLY ACKNOWLEDGE THAT ANIRBAN’s ACADEMY SHALL NOT BE LIABLE FOR ANIRBAN’s ACADEMY CONTENT OR THE DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY AND THAT THE RISK OF HARM OR DAMAGE FROM THE FOREGOING RESTS ENTIRELY WITH YOU.
                THE ANIRBAN’s ACADEMY PLATFORM IS CONTROLLED AND OFFERED BY ANIRBAN’s ACADEMY FROM ITS FACILITIES IN INDIA. ANIRBAN’s ACADEMY MAKES NO REPRESENTATIONS THAT THE ANIRBAN’s ACADEMY PLATFORM IS APPROPRIATE OR AVAILABLE FOR USE IN OTHER LOCATIONS. THOSE WHO ACCESS OR USE THE ANIRBAN’s ACADEMY PLATFORM FROM OTHER JURISDICTIONS DO SO AT THEIR OWN VOLITION AND ARE RESPONSIBLE FOR COMPLIANCE WITH LOCAL LAW.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>INDEMNITY</span>

              </div><p>
                To the extent permitted by applicable law, you agree to defend, indemnify and hold harmless ANIRBAN’s ACADEMY, its parent corporation, officers, directors, employees and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the ANIRBAN’s ACADEMY Platform; (ii) your violation of any term of these Terms and Conditions; (iii) your violation of any third party right, including without limitation any copyright, property, or privacy right; (iv) any claim that your ANIRBAN’s ACADEMY content caused damage to a third party; or (v) violation of any applicable laws. This defense and indemnification obligation will survive these Terms and Conditions and your use of the ANIRBAN’s ACADEMY Platform.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>ELIGIBILITY TO USE AND ACCEPTANCE OF THE TERMS AND CONDITION</span>

              </div><p>
                You affirm that you are either more than 18 years of age, or possess legal parental or guardian consent, and are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms and Conditions, and to abide by and comply with these Terms and Conditions. If you are under 18 years of age, then please talk to your parents or guardian before using the ANIRBAN’s ACADEMY Platform.
                ANIRBAN’s ACADEMY reserves the right to refuse access to use the ANIRBAN’s ACADEMY Platforms to any Users or to suspend and/or terminate access granted to existing registered Users at any time without according any reasons for doing so.
                We provide these Terms and Conditions with our ANIRBAN’s ACADEMY Platform so that you know what terms apply to your use. You acknowledge that we have given you a reasonable opportunity to review these Terms and Conditions and that you have agreed to them. You agree and acknowledge that your use of the ANIRBAN’s ACADEMY Platform is subject to the most current version of the Terms and Conditions made available on the ANIRBAN’s ACADEMY Platform at the time of such use.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>FORCE MAJURE</span>

              </div><p>
                ANIRBAN’s ACADEMY shall not be liable for failure to perform, or the delay in performance of, any of its obligations if, and to the extent that, such failure or delay is caused by events substantially beyond its control, including but not limited to acts of God, acts of the public enemy or governmental body in its sovereign or contractual capacity, war, terrorism, floods, fire, strikes, epidemics, civil unrest or riots, power outage, and/or unusually severe weather.
              </p>
              <br />
              <p>
                <strong>
                  These Terms and Conditions are published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011 that require publishing the rules and regulations, privacy policy, and terms and conditions for access or usage of the ANIRBAN’s ACADEMY Platform.
                  You are advised not to post any information or messages that are, or that may be construed, as being malicious, defamatory, inappropriate, slanderous, pornographic or otherwise sexually-oriented or that makes attacks on or the otherwise opines or comments on any individuals or groups of individuals, educational institutions or any other entities whatsoever (whether companies, firms, or any other institutions). You also agree not to post any information to which you do not have copyrights or other appropriate permissions to post in a public forum. Your failure to comply with these terms may result in the removal of your postings without prior notice to the User. The IP address of all posts is recorded to aid in enforcing these condition
                  Certain laws require to maintain data with respect to the ANIRBAN’s ACADEMY Platform and other personal information in a prescribed format and ANIRBAN’s ACADEMY will use all the information to the extent required in compliance with the applicable laws and as may be directed or amended from time to time.
                </strong>
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>MODIFICATION OR AMENDMENT TO THESE TERMS AND CONDITIONS</span>

              </div><p>
                ANIRBAN’s ACADEMY may, in its sole discretion, modify or update these Terms and Conditions and policies at any time, and you agree to be bound by such modifications or revisions. Your continued use of the ANIRBAN’s ACADEMY Platform post any modification of the Terms and Conditions shall be taken as your consent and acceptance to such modifications. Nothing in these Terms and Conditions shall be deemed to confer any third-party rights or benefits.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>WE DON'T SUPPORT I - PHONE / APPLE DEVICES</span>
              </div>
              <p>
                We apologize, however, currently we don’t have any app for Apple phones/ i-phones, we have developed only android app.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>EDUCATIONAL PURPOSE ONLY</span>
              </div>
              <p>
                This app is designed solely for educational purposes to help users develop skills. We do not guarantee any income or financial success from using this app.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>NO INCOME ASSURANCE</span>
              </div>
              <p>
                The skills and knowledge provided by ANIRBAN’s ACADEMY platform for personal growth and learning. We do not promise or imply any job placement, business success, or earnings.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>REFUND AND CANCELLATION POLICY</span>

              </div><p>
                Please remember before purchasing any course, once you have purchased you cannot change or cancel your course at any cost. Once you enroll and make the require payment, it shall be final and cannot be changed or modified and neither will there be any refund.
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'dark blue', fontWeight: 'bold', fontSize: '24px' }}>BATCH VALIDITY AND BATCH CHANGE</span>

              </div><p>
                The validity of VOD or RECORDED videos and PDFS will be mentioned on the product page in website and in RECORDED VIDEO SESSION and NOTES section in app.
                How ever we don’t allow user(s) to change or shift batch(es) after purchased by user(s).
              </p>
              <br />

              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#b3b613', fontWeight: 'bold', fontSize: '35px' }}>CONTACT US</span>
              </div>
              <p>
                You can contact us through Website contact us page by sending us a message, or by email at -
                <strong> info@anirbansacademy.com </strong> or through our application CONTACT ME icon by using our chat service.
              </p>
            </>
          )
        }
      ]
    },
    "Privacy Policy": {
      title: "Privacy Policy",
      content: [
        {
          text: (
            <>
              <p>
                This Privacy Policy describes how and its affiliates (collectively "ANIRBAN's ACADEMY, we, our, us") collect, use, share, protect or otherwise process your information/ personal data through our application and our website <a href="https://anirbansacademy.com">https://anirbansacademy.com</a> (hereinafter referred to as Platform).
              </p>
              <br />
              <p>
                We do not offer any product/service under this Platform outside India and your personal data will primarily be stored and processed in India. By visiting this Platform, providing your information or availing any product/service offered on the Platform, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions, and agree to be governed by the laws of India including but not limited to the laws applicable to data protection and privacy. If you do not agree please do not use or access our Platform.
              </p>
              <br />
              <p style={{ textIndent: '100px' }}>
                - We collect your personal data when you use our Platform, services or otherwise interact with us during the course of our relationship and related information provided from time to time. Some of the information that we may collect includes but is not limited to personal data / information provided to us during sign-up/registering or using our Platform.
              </p>

              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>COLLECTION OF PERSONALLY IDENTIFIABLE INFORMATION</span>
              </div>
              <p>
                We collect certain information about You to help us serve You better. The information collected by Us is of the following nature which you give us at the time of registration or using our Platform.
                <br />
                • Name,
                <br />
                • Telephone/ mobile number
                <br />
                • Email ID
                <br />
                • Address which you give us
                <br />
                • User uploaded photo and IDs
                <br />
                • Your IP address
                <br />
                • Information about your device and device unique id
                <br />
                • Network information
                <br />
                • Demographic information such as postcode, preferences and interests,
              </p>
              <br />
              <p>
                Any other personal information which you give us in connection while booking a service.
              </p>
              <br />
              <p style={{ textIndent: '100px' }}>
                We use your personal data to assist sellers and business partners in handling and fulfilling orders; enhancing customer experience; to resolve disputes; troubleshoot problems; inform you about online and offline offers, products, services, and updates; customize your experience; detect and protect us against error, fraud and other criminal activity; enforce our terms and conditions; conduct marketing research, analysis and surveys; and as otherwise described to you at the time of collection of information. You understand that your access to these products/services may be affected in the event permission is not provided to us.
              </p>
              <br />
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>HOW WE STORE YOUR PERSONAL INFORMATION</span>
              </div>
              <p>
                We will store your username, phone number, email id, specialty on an unencrypted server. Your password is cryptographically hashed. These information elements are referred to collectively as your "Personal User Information." We collect and hold this information for the purpose of administering your use of the Application.
              </p>
              <p>
                Some of the sensitive personal data may be collected with your consent, such as your bank account or credit or debit card or other payment instrument information or biometric information such as your facial features or physiological information (in order to enable use of certain features when opted for, available on the Platform) etc.
              </p>
              <p>
                We may track your behaviour, preferences, and other information that you choose to provide on our Platform. This information is compiled and analyzed on an aggregated basis. We will also collect your information related to your transactions on Platform and such third-party business partner platforms.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>SECURITY PRECAUTIONS</span>
              </div>
              <p>
                To protect your personal data from unauthorized access or disclosure, loss or misuse we adopt reasonable security practices and procedures. Once your information is in our possession or whenever you access your account information, we adhere to our security guidelines to protect it against unauthorized access and offer the use of a secure server. However, the transmission of information is not completely secure for reasons beyond our control. By using the Platform, the users accept the security implications of data transmission over the internet and the World Wide Web which cannot always be guaranteed as completely secure, and therefore, there would always remain certain inherent risks regarding use of the Platform. Users are responsible for ensuring the protection of login and password records for their account.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>SHARING YOUR PERSONAL INFORMATION</span>
              </div>
              <p>
                We do not sell, trade, or rent user(s) personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates and advertisers.
              </p>
              <p>
                We may disclose personal and sensitive personal data to government agencies or other authorized law enforcement agencies if required to do so by law or in the good faith belief that such disclosure is reasonably necessary to respond to subpoenas, court orders, or other legal process. We may disclose personal data to law enforcement offices, third party rights owners, or others in the good faith belief that such disclosure is reasonably necessary to: enforce our Terms of Use or Privacy Policy; respond to claims that an advertisement, posting or other content violates the rights of a third party; or protect the rights, property or personal safety of our users or the general public
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>Do third parties see and/or have access to information obtained by ANIRBAN's ACADEMY Application?</span>
              </div>
              <p>
                Only aggregated, anonymized data is periodically transmitted to external services to aid the ANIRBAN' ACADEMY platform in improving the Application and their service. We may share your information with third parties in the ways that are described in this privacy statement.
              </p>
              <p>
                Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. Below are the links to the Privacy Policy of the third-party service providers used by the Application:
              </p>
              <p>
                • <a href="">Payment gateway service</a><br />
                • <a href="https://www.google.com/policies/privacy/">Google Play Services</a><br />
                • <a href="https://support.google.com/admob/answer/6128543?hl=en">Ad Mob</a><br />
                • <a href="https://firebase.google.com/support/privacy">Google Analytics for Firebase</a><br />
                • <a href="">Google analytics 4</a><br />
                • <a href="https://firebase.google.com/support/privacy/">Firebase Crashlytics</a><br />
                • <a href="https://www.facebook.com/about/privacy/update/printable">Facebook</a><br />
                • <a href="https://unity3d.com/legal/privacy-policy">Unity</a><br />
                • <a href="https://onesignal.com/privacy_policy">One Signal</a><br />
                • <a href="https://www.applovin.com/privacy/">App Lovin</a><br />
                • <a href="https://www.startapp.com/privacy/">Start App</a>
              </p>
              <p style={{ textIndent: '100px' }}>
                When such a third-party business partner collects your personal data directly from you, you will be governed by their privacy policies. We shall not be responsible for the third-party business partner's privacy practices or the content of their privacy policies, and we request you to read their privacy policies prior to disclosing any information.
              </p>
              <p>
                If you receive an email, a call from a person/association claiming to be seeking any personal data like debit/credit card PIN, net-banking or mobile banking password, we request you to never provide such information. If you have already revealed such information, report it immediately to an appropriate law enforcement agency.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>WHAT ARE YOUR CHOICE/OPT-OUT RIGHTS?</span>
              </div>
              <p>
                You can halt all collection of information by the ANIRBAN's ACADEMY application easily by uninstalling the Application. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network. You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>DATA RETENTION AND DELETION POLICY FOR APPLICATION</span>
              </div>
              <p>
                We will retain User Provided data for as long as you use the ANIRBAN's ACADEMY Application and for a reasonable time thereafter. ANIRBAN's ACADEMY will retain Automatically Collected information for up to 24 months and thereafter may store it in aggregate. If you'd like the ANIRBAN's ACADEMY to delete User Provided Data that you have provided via the Application at the time of registration process, please contact us at info@anirbansacademy.com and we will respond in a reasonable time. Please note that some or all of the User Provided Data may be required in order for the Application to function properly.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>CONSENT</span>
              </div>
              <p>
                By visiting our Platform or by providing your information, you consent to the collection, use, storage, disclosure and otherwise processing of your information on the Platform in accordance with this Privacy Policy. If you disclose to us any personal data relating to other people, you represent that you have the authority to do so and permit us to use the information in accordance with this Privacy Policy. You, while providing your personal data over the Platform or any partner platforms or establishments, consent to us (including our other corporate entities, affiliates, lending partners, technology partners, marketing channels, business partners and other third parties) to contact you through SMS, instant messaging apps, call and/or e-mail for the purposes specified in this Privacy Policy. You have an option to withdraw your consent that you have already provided by writing to the Grievance Officer at the contact information provided below. Please mention "Withdrawal of consent for processing personal data" in your subject line of your communication. We may verify such requests before acting on our request. However, please note that your withdrawal of consent will not be retrospective and will be in accordance with the Terms of Use, this Privacy Policy, and applicable laws. In the event you withdraw consent given to us under this Privacy Policy, we reserve the right to restrict or deny the provision of our services for which we consider such information to be necessary.
              </p>
              <br />
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }}>CHANGES TO THIS PRIVACY POLICY</span>
              </div>
              <p>
                Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices. We may alert / notify you about the significant changes to the Privacy Policy, in the manner as may be required under applicable laws
              </p>
              <br />
              <div style={{ marginTop: '30px' }}>
                <p><strong>Note:</strong></p>
                <p>
                  User must verify his/her name in ANIRBAN's ACADEMY application dashboard and same as profile section and also email address before purchase any course to ensure that the account belongs to him.
                </p>
              </div>
            </>
          )
        }

      ]
    },
    "Refund & Cancellation Policy": {
      title: "Refund & Cancellation Policy",
      content: [
        {
          text: (
            <>
              <strong>Please remember before purchasing any course</strong>, once you have purchased you cannot change or cancel your course at any cost.
              <br /><br />
              Once you enroll and make the require payment, it shall be final and cannot be changed or modified and neither will there be any refund.
            </>
          )
        }
      ]
    },
    "Shipping & Delivery Policy": {
      title: "Shipping & Delivery Policy",
      content: [
        {
          text: "No shipping and delivery applicable for this business."
        }
      ]
    }
  };

  const currentPolicy = policies[policyType] || { title: "Policy Not Found", content: [{ heading: "", text: "The requested policy could not be found." }] };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="py-16 bg-background flex-grow" id="top">
        <style>{`
          footer {
            display: none !important;
          }
        `}</style>
        <div className="px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center" >
              <span className="text-gradient">{currentPolicy.title}</span>
            </h1>

            <div className="space-y-8">
              {currentPolicy.content.map((section, index) => (
                <div key={index} className="bg-card p-4 rounded-lg shadow-md border">
                  {section.heading && <p className="text-2xl font-semibold mb-4 text-card-foreground">{section.heading}</p>}
                  {typeof section.text === 'string' && <p className="text-muted-foreground leading-relaxed">{section.text}</p>}
                  {typeof section.text !== 'string' && section.text}
                  {section.list && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                      {section.list.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Simple Footer */}
      <div role="contentinfo" className="bg-[#191919] text-white py-6 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center">
          <div className="text-center text-xs md:text-sm font-semibold tracking-wide uppercase">
            © COPYRIGHT 2026 <span className="text-[#f25304]">ANIRBAN'S ACADEMY</span>. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
