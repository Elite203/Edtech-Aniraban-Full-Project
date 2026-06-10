-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 18, 2026 at 06:30 PM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u958214831_Admin_Panel`
--

-- --------------------------------------------------------

--
-- Table structure for table `passages`
--

CREATE TABLE `passages` (
  `id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `topic_id` int(11) DEFAULT NULL,
  `passage_english` text DEFAULT NULL,
  `passage_hindi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `solution_english` text DEFAULT NULL,
  `solution_hindi` text DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `passages`
--

INSERT INTO `passages` (`id`, `subject_id`, `topic_id`, `passage_english`, `passage_hindi`, `created_at`, `solution_english`, `solution_hindi`, `youtube_link`) VALUES
(1, 79, 7, '<p>&nbsp;&nbsp;&nbsp;&lt;button</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;onClick={handleSaveSubQuestion}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;className=\"px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm\"</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{editingSubQuestionIndex !== null ? \'Update Sub-Question\' : \'Add Sub-Question\'}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/button&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) : (</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;button</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;onClick={handleSaveQuestion}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;className=\"px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors\"</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;disabled={isLoading}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{editingQuestion ? \'💾 Update Question\' : \'💾 Save Question\'}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/button&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)}</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/div&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/div&gt;</p><p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/motion.div&gt;</p>', '<p>QUERY LENGTH LIMIT EXCEEDED. MAX ALLOWED QUERY : 500 CHARSrgrdgdrgdr</p>', '2026-04-02 16:25:34', NULL, NULL, NULL),
(2, 142, NULL, '<p>control. He is a master of disguise, multilingual, and an expert in espionage, often gathering information under the</p><p>identity of Matches Malone, a notorious gangster. He is a master of stealth and escapoloqy. which allows him to</p><p>appear and disappear at will and to break free of nearly inescapable deathtraps with little to no harm.Batman is an</p><p>expert in interrogation techniques and often uses extreme methods to extract information from suspects, such as</p><p>hanging a person over the edge of a building. Hisintimidatinq and frightening appearance alone is often all that is</p><p>needed in getting information from suspects. Despite having the potential to harm his enemies, Batman\'s most</p><p>defining characteristic is his strong commitment to justice and his unwillingness to take life, regardless of the</p><p>situation he has faced. This unyielding moral rectitude has earned him the respect of several heroes in the DC</p><p>Universe, most notably that of Superman and Wonder Woman.TechnoloqyPersonal armorMain</p><p>article: BatsuitBatman\'s body armored costume incorporates the imagery of a bat in order to frighten</p><p>criminals.[991 The details of the Batman costume change repeatedly through various decades, stories, media and</p><p>artists\' interpretations, but the most distinctive elements remain consistent: a scallop-hem cape; a cowl covering</p><p>most of the face; a pair of batlike ears; a stylized bat emblem on the chest; and the ever-present utility belt. The</p><p>costumes\' colors have traditionally been dark blue and grey,[991 although this colorization arose due to the way</p><p>comic book art was colored;[991the character is sometimes depicted in black and grey. Finger and Kane</p><p>conceptualized Batman as having a black cape and cowl and grey suit, but conventions in coloring called for black</p><p>to be highlighted with blue.[991 In the Tim Burton\'s Batman and Batman Returns films. Batman has been depicted</p><p>as completely black with a bat in the middle surrounded by a yellow background. Christopher Nolan\'s The Dark</p><p>Knight Trilogy depicted Batman wearing high-tech gear painted completely black with a black bat in the</p><p>middle.Batman\'s batsuitaids in his combat against enemies, having the properties of bo</p>', '<p>QUERY LENGTH LIMIT EXCEEDED. MAX ALLOWED QUERY : 500 CHARS</p>', '2026-04-03 14:49:55', NULL, NULL, NULL),
(3, 79, 18, '<p>The Industrial Revolution, beginning in the late 18th century, marked a turning point in history. It transformed economies that had been based on agriculture and handicrafts into ones dominated by industry and machine manufacturing. Innovations such as the steam engine, mechanized textile production, and improved iron-making techniques fueled rapid urbanization. However, this progress also brought challenges: overcrowded cities, harsh working conditions, and environmental pollution.</p>', '<p>18 वीं शताब्दी के अंत में शुरू हुई औद्योगिक क्रांति ने इतिहास में एक महत्वपूर्ण मोड़ को चिह्नित किया। इसने कृषि और हस्तशिल्प पर आधारित अर्थव्यवस्थाओं को उद्योग और मशीन निर्माण के प्रभुत्व वाली अर्थव्यवस्थाओं में बदल दिया। स्टीम इंजन, मैकेनाइज्ड टेक्सटाइल प्रोडक्शन और बेहतर आयरन बनाने की तकनीकों जैसे नवाचारों ने तेजी से शहरीकरण को बढ़ावा दिया। हालांकि, इस प्रगति ने चुनौतियों को भी जन्म दिया: भीड़भाड़ वाले शहर, कठोर काम करने की स्थिति और पर्यावरण प्रदूषण।</p>', '2026-04-07 12:40:53', '<p>dawdwadwadawdwada</p>', '<p>dawdwadwadawdwada</p>', 'https://youtu.be/ATeajE9MzWw?si=bWjjnVfCsoFvwgry'),
(4, 185, NULL, '<p>Directions (144-149): Read the following passage and answer the given questions.</p><p>In the intricate tapestry of the Middle East\'s economic landscape, countries face enduring challenges, and Portugal\'s ministerial predicament sheds light on the shortcomings of past economic philosophies. Two ministers, Maria Silva and João Rodrigues, grapple with distinct and now seemingly inadequate approaches, reflecting a negative tone in the quest to revive the economy.</p><p>Maria Silva, advocating a meticulous, methodical approach, once celebrated for its practicality, finds her strategies faltering in the face of evolving challenges. Studying the highs and lows of the economy and addressing root causes was once considered a robust strategy. On the opposing front, João Rodrigues champions an immediate solution – the infusion of cash and monetary resources into the economy. This Keynesian approach, effective in the past, now reveals its flaws in the contemporary economic landscape. Rapid cash injections, while providing a quick fix, risk contributing to inflation and fail to address the deep-seated, structural issues at the heart of the economic challenges. These once-successful policies from the 1980s are now proving inadequate in the current scenario. The failure of Silva\'s methodical approach lies in its inability to swiftly adapt to the rapid changes and interconnectedness characterizing today\'s global economy. Conversely, Rodrigues\' cash infusion strategy, while providing short-term relief, lacks the foresight needed to address the intricate challenges that have evolved over time. The inadequacy of these policies in today\'s scenario underscores the necessity for innovative, adaptive strategies that account for the complexities of modern economies. Globalization, technological advancements, and shifting geopolitical landscapes demand a departure from historical approaches. The difficulty in reviving the Middle East\'s economy serves as a cautionary tale, emphasizing the imperative for forward-thinking policies that can navigate the intricacies of the contemporary economic environment.</p>', '', '2026-04-08 06:19:16', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `passages`
--
ALTER TABLE `passages`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `passages`
--
ALTER TABLE `passages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
