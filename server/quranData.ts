export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  audio?: string;
}

export interface SurahDetail extends SurahMeta {
  ayahs: Ayah[];
}

export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Maaida", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Ta-Ha", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, name: "المؤمنون", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, name: "النور", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "الروم", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "السجدة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سبإ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "فاطر", englishName: "Faatir", englishNameTranslation: "The Originator", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Ya-Seen", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "الصافات", englishName: "As-Saaffaat", englishNameTranslation: "Those who set the Ranks", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "The Letter Saad", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jaathiya", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujuraat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "The Letter Qaaf", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "الطور", englishName: "At-Toor", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", englishNameTranslation: "The Congregation, Friday", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, name: "المنافقون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, name: "التغابن", englishName: "At-Taghaabun", englishNameTranslation: "The Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "الطلاق", englishName: "At-Talaaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "التحريم", englishName: "At-Tahreem", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "الحاقة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "نوح", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "الإنسان", englishName: "Al-Insaan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "النبإ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "النازعات", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "التكوير", englishName: "At-Takweer", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifeen", englishNameTranslation: "Defrauding", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "البروج", englishName: "Al-Burooj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "الطارق", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "الأعلى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "الليل", englishName: "Al-Layl", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "الضحى", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "التين", englishName: "At-Teen", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "البينة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, name: "العاديات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, name: "القارعة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "التكاثر", englishName: "At-Takaathur", englishNameTranslation: "The Rivalry in World Increase", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day, Time", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "الهمزة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "الفيل", englishName: "Al-Feel", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "الماعون", englishName: "Al-Maa'oon", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "الكافرون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlaas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" }
];

// Offline built-in cache for core surahs
const BUILT_IN_SURAHS: Record<number, Ayah[]> = {
  1: [
    { number: 1, numberInSurah: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3" },
    { number: 2, numberInSurah: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3" },
    { number: 3, numberInSurah: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful,", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3" },
    { number: 4, numberInSurah: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3" },
    { number: 5, numberInSurah: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3" },
    { number: 6, numberInSurah: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path -", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3" },
    { number: 7, numberInSurah: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3" }
  ],
  112: [
    { number: 6222, numberInSurah: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One,", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3" },
    { number: 6223, numberInSurah: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3" },
    { number: 6224, numberInSurah: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born,", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3" },
    { number: 6225, numberInSurah: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent.'", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3" }
  ],
  113: [
    { number: 6226, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Say, 'I seek refuge in the Lord of daybreak", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6226.mp3" },
    { number: 6227, numberInSurah: 2, text: "مِن شَرِّ مَا خَلَقَ", translation: "From the evil of that which He created", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6227.mp3" },
    { number: 6228, numberInSurah: 3, text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", translation: "And from the evil of darkness when it settles", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6228.mp3" },
    { number: 6229, numberInSurah: 4, text: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", translation: "And from the evil of the blowers in knots", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6229.mp3" },
    { number: 6230, numberInSurah: 5, text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", translation: "And from the evil of an envier when he envies.'", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6230.mp3" }
  ],
  114: [
    { number: 6231, numberInSurah: 1, text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Say, 'I seek refuge in the Lord of mankind,", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6231.mp3" },
    { number: 6232, numberInSurah: 2, text: "مَلِكِ النَّاسِ", translation: "The Sovereign of mankind.", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6232.mp3" },
    { number: 6233, numberInSurah: 3, text: "إِلَٰهِ النَّاسِ", translation: "The God of mankind,", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6233.mp3" },
    { number: 6234, numberInSurah: 4, text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", translation: "From the evil of the retreating whisperer -", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6234.mp3" },
    { number: 6235, numberInSurah: 5, text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", translation: "Who whispers [evil] into the breasts of mankind -", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6235.mp3" },
    { number: 6236, numberInSurah: 6, text: "مِنَ الْجِنَّةِ وَالنَّاسِ", translation: "From among the jinn and mankind.'", audio: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3" }
  ]
};

// In-memory cache for surahs fetched from API
const surahCache = new Map<number, Ayah[]>();

export async function fetchSurahWithAyahs(surahNum: number): Promise<SurahDetail | null> {
  const meta = SURAHS_LIST.find(s => s.number === surahNum);
  if (!meta) return null;

  if (surahCache.has(surahNum)) {
    return { ...meta, ayahs: surahCache.get(surahNum)! };
  }

  if (BUILT_IN_SURAHS[surahNum]) {
    surahCache.set(surahNum, BUILT_IN_SURAHS[surahNum]);
    return { ...meta, ayahs: BUILT_IN_SURAHS[surahNum] };
  }

  try {
    // Al-Quran Cloud public API with Sahih International English translation
    const url = `https://api.alquran.cloud/v1/surah/${surahNum}/editions/quran-uthmani,en.sahih`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const json = await res.json() as any;
      if (json?.data && json.data.length >= 2) {
        const arabicData = json.data[0]?.ayahs || [];
        const englishData = json.data[1]?.ayahs || [];
        const combined: Ayah[] = arabicData.map((ar: any, idx: number) => ({
          number: ar.number,
          numberInSurah: ar.numberInSurah,
          text: ar.text,
          translation: englishData[idx]?.text || '',
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ar.number}.mp3`
        }));
        surahCache.set(surahNum, combined);
        return { ...meta, ayahs: combined };
      }
    }
  } catch (err) {
    console.warn(`Could not fetch Surah ${surahNum} from external API, falling back to minimal representation:`, err);
  }

  // Graceful fallback for any surah if internet request times out
  const fallbackAyahs: Ayah[] = Array.from({ length: Math.min(meta.numberOfAyahs, 10) }, (_, i) => ({
    number: i + 1,
    numberInSurah: i + 1,
    text: i === 0 && surahNum !== 9 ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : `آية رقم ${i + 1}`,
    translation: `Verse ${i + 1} of ${meta.englishName}. (Connect to the internet to stream full recitation and text)`,
    audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${i + 1}.mp3`
  }));

  return { ...meta, ayahs: fallbackAyahs };
}
