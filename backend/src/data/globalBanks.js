/**
 * Global Bank Directory — 140+ countries
 * Each entry: { code, name, flag, banks: [{ name, swift?, code? }] }
 *
 * The 'country' and 'currency' are inferred from the selected bank,
 * so users only need to pick a bank from this single searchable list.
 */

const GLOBAL_BANKS = [
  // ── ASIA PACIFIC ──────────────────────────────────────────────────────────
  {
    code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR',
    banks: [
      { name: 'Maybank', swift: 'MBBEMYKL' },
      { name: 'CIMB Bank', swift: 'CIBBMYKL' },
      { name: 'Public Bank Berhad', swift: 'PBBEMYKL' },
      { name: 'RHB Bank', swift: 'RHBBMYKL' },
      { name: 'Hong Leong Bank', swift: 'HLBBMYKL' },
      { name: 'AmBank', swift: 'ARBKMYKL' },
      { name: 'Alliance Bank', swift: 'MFBBMYKL' },
      { name: 'Bank Islam', swift: 'BIMBMYKL' },
      { name: 'Bank Rakyat', swift: 'BKMB MY KL' },
      { name: 'Bank Simpanan Nasional (BSN)', swift: 'BSNAMYKL' },
    ],
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD',
    banks: [
      { name: 'DBS Bank', swift: 'DBSSSGSG' },
      { name: 'OCBC Bank', swift: 'OCBCSGSG' },
      { name: 'UOB Bank', swift: 'UOVBSGSG' },
      { name: 'Standard Chartered Singapore', swift: 'SCBLSG22' },
      { name: 'Citibank Singapore', swift: 'CITISGSG' },
      { name: 'HSBC Singapore', swift: 'HSBCSGSG' },
      { name: 'Maybank Singapore', swift: 'MBBESGSG' },
      { name: 'Bank of China Singapore', swift: 'BKCHSGSG' },
    ],
  },
  {
    code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR',
    banks: [
      { name: 'Bank Central Asia (BCA)', swift: 'CENAIDJA' },
      { name: 'Bank Mandiri', swift: 'BMRIIDJA' },
      { name: 'Bank Rakyat Indonesia (BRI)', swift: 'BRINIDJA' },
      { name: 'Bank Negara Indonesia (BNI)', swift: 'BNINIDJA' },
      { name: 'Bank CIMB Niaga', swift: 'BNIAIDJA' },
      { name: 'Bank Danamon', swift: 'BDINIDJA' },
      { name: 'Bank Permata', swift: 'BBBAIDJA' },
      { name: 'Bank Tabungan Negara (BTN)', swift: 'BTANIDJA' },
    ],
  },
  {
    code: 'TH', name: 'Thailand', flag: '🇹🇭', currency: 'THB',
    banks: [
      { name: 'Bangkok Bank', swift: 'BKKBTHBK' },
      { name: 'Kasikorn Bank (KBank)', swift: 'KASITHBK' },
      { name: 'SCB (Siam Commercial Bank)', swift: 'SICOTHBK' },
      { name: 'Krung Thai Bank', swift: 'KRTHTHBK' },
      { name: 'Bank of Ayudhya (Krungsri)', swift: 'AYUDTHBK' },
      { name: 'TMBThanachart Bank (ttb)', swift: 'TMBKTHBK' },
    ],
  },
  {
    code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP',
    banks: [
      { name: 'BDO Unibank', swift: 'BNORPHMM' },
      { name: 'Metrobank', swift: 'MBTCPHMM' },
      { name: 'BPI (Bank of the Philippine Islands)', swift: 'BOPIPHMM' },
      { name: 'Land Bank of the Philippines', swift: 'TLBPPHMM' },
      { name: 'PNB (Philippine National Bank)', swift: 'PNBMPHMM' },
      { name: 'Union Bank Philippines', swift: 'UBPHPHMM' },
      { name: 'Security Bank', swift: 'SETCPHMM' },
    ],
  },
  {
    code: 'VN', name: 'Vietnam', flag: '🇻🇳', currency: 'VND',
    banks: [
      { name: 'Vietcombank', swift: 'BFTVVNVX' },
      { name: 'VietinBank', swift: 'ICBVVNVX' },
      { name: 'BIDV', swift: 'BIDVVNVX' },
      { name: 'Agribank', swift: 'VBAAVNVX' },
      { name: 'Techcombank', swift: 'VTCBVNVX' },
      { name: 'MB Bank', swift: 'MSCBVNVX' },
      { name: 'ACB Bank', swift: 'ASCBVNVX' },
      { name: 'VPBank', swift: 'VPBKVNVX' },
    ],
  },
  {
    code: 'TW', name: 'Taiwan', flag: '🇹🇼', currency: 'TWD',
    banks: [
      { name: 'CTBC Bank', swift: 'CTCBTWTPXXX' },
      { name: 'Taipei Fubon Bank', swift: 'FUBOTWTPXXX' },
      { name: 'Mega International Commercial Bank', swift: 'ICBCTWTP' },
      { name: 'First Commercial Bank', swift: 'FCBKTWTP' },
      { name: 'Hua Nan Commercial Bank', swift: 'HNBKTWTP' },
      { name: 'Land Bank of Taiwan', swift: 'LBOTTWTP' },
      { name: 'Taiwan Cooperative Bank', swift: 'TACBTWTP' },
    ],
  },
  {
    code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD',
    banks: [
      { name: 'HSBC Hong Kong', swift: 'HSBCHKHHHKH' },
      { name: 'Bank of China (Hong Kong)', swift: 'BKCHHKHH' },
      { name: 'Hang Seng Bank', swift: 'HASEHKHH' },
      { name: 'Standard Chartered Hong Kong', swift: 'SCBLHKHH' },
      { name: 'Citibank Hong Kong', swift: 'CITIHKHX' },
      { name: 'DBS Hong Kong', swift: 'DBSSHKHH' },
      { name: 'OCBC Wing Hang Bank', swift: 'WIHBHKHH' },
    ],
  },
  {
    code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY',
    banks: [
      { name: 'Industrial and Commercial Bank of China (ICBC)', swift: 'ICBKCNBJ' },
      { name: 'China Construction Bank (CCB)', swift: 'PCBCCNBJ' },
      { name: 'Bank of China (BOC)', swift: 'BKCHCNBJ' },
      { name: 'Agricultural Bank of China (ABC)', swift: 'ABOCCNBJ' },
      { name: 'Bank of Communications (BoCom)', swift: 'COMMCNSH' },
      { name: 'China Merchants Bank', swift: 'CMBCCNBS' },
      { name: 'CITIC Bank', swift: 'CIBKCNBJ' },
      { name: 'Ping An Bank', swift: 'SZDBCNBS' },
    ],
  },
  {
    code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY',
    banks: [
      { name: 'MUFG Bank (Mitsubishi UFJ)', swift: 'BOTKJPJT' },
      { name: 'Sumitomo Mitsui Banking Corporation (SMBC)', swift: 'SMBCJPJT' },
      { name: 'Mizuho Bank', swift: 'MHCBJPJT' },
      { name: 'Resona Bank', swift: 'DIWAJPJT' },
      { name: 'Japan Post Bank (Yucho)', swift: 'JPPYJPJT' },
      { name: 'Shinsei Bank', swift: 'AGSSJPJT' },
    ],
  },
  {
    code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW',
    banks: [
      { name: 'KB Kookmin Bank', swift: 'CZNBKRSE' },
      { name: 'Shinhan Bank', swift: 'SHBKKRSE' },
      { name: 'Woori Bank', swift: 'HVBKKRSE' },
      { name: 'Hana Bank', swift: 'KOEXKRSE' },
      { name: 'IBK (Industrial Bank of Korea)', swift: 'IBKOKRSE' },
      { name: 'NH NongHyup Bank', swift: 'NACFKRSE' },
      { name: 'Kakao Bank', swift: 'KAKOKR22' },
    ],
  },
  {
    code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR',
    banks: [
      { name: 'State Bank of India (SBI)', swift: 'SBININBB' },
      { name: 'HDFC Bank', swift: 'HDFCINBB' },
      { name: 'ICICI Bank', swift: 'ICICINBB' },
      { name: 'Axis Bank', swift: 'UTIBINBB' },
      { name: 'Punjab National Bank (PNB)', swift: 'PUNBINBB' },
      { name: 'Bank of Baroda', swift: 'BARBINBB' },
      { name: 'Kotak Mahindra Bank', swift: 'KKBKINBB' },
      { name: 'IndusInd Bank', swift: 'INDBINBB' },
      { name: 'YES Bank', swift: 'YESBINBB' },
      { name: 'Canara Bank', swift: 'CNRBINBB' },
    ],
  },
  {
    code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR',
    banks: [
      { name: 'Habib Bank Limited (HBL)', swift: 'HABBPKKA' },
      { name: 'National Bank of Pakistan (NBP)', swift: 'NBPAPKKA' },
      { name: 'MCB Bank', swift: 'MUCBPKKA' },
      { name: 'United Bank Limited (UBL)', swift: 'UNILPKKA' },
      { name: 'Allied Bank', swift: 'ABPAPKKA' },
      { name: 'Meezan Bank', swift: 'MEZNPKKA' },
    ],
  },
  {
    code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT',
    banks: [
      { name: 'Sonali Bank', swift: 'SONABDDH' },
      { name: 'Dutch-Bangla Bank (DBBL)', swift: 'DBBLBDDH' },
      { name: 'BRAC Bank', swift: 'BRAKBDDH' },
      { name: 'Islami Bank Bangladesh', swift: 'IBBLBDDH' },
      { name: 'Prime Bank', swift: 'PRBLBDDH' },
    ],
  },
  {
    code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR',
    banks: [
      { name: 'Bank of Ceylon (BOC)', swift: 'BCEYLKLX' },
      { name: 'People\'s Bank Sri Lanka', swift: 'PEPLLKLX' },
      { name: 'Commercial Bank of Ceylon', swift: 'CCEYLKLX' },
      { name: 'Hatton National Bank (HNB)', swift: 'HBLILKLX' },
      { name: 'Sampath Bank', swift: 'BSAMLKLX' },
    ],
  },
  {
    code: 'NP', name: 'Nepal', flag: '🇳🇵', currency: 'NPR',
    banks: [
      { name: 'Nepal Bank Limited', swift: 'NEBLNPKA' },
      { name: 'Rastriya Banijya Bank (RBB)', swift: 'RBBBNPKA' },
      { name: 'Nabil Bank', swift: 'NABILNPKA' },
      { name: 'Standard Chartered Nepal', swift: 'SCBLNPKA' },
    ],
  },
  {
    code: 'MM', name: 'Myanmar', flag: '🇲🇲', currency: 'MMK',
    banks: [
      { name: 'Myanma Economic Bank (MEB)', swift: 'MECBMMM1' },
      { name: 'KBZ Bank', swift: 'KBZAMMMM' },
      { name: 'CB Bank (Co-operative Bank)', swift: 'COBAMMMM' },
      { name: 'AYA Bank', swift: 'AYMBMMMM' },
    ],
  },
  {
    code: 'KH', name: 'Cambodia', flag: '🇰🇭', currency: 'KHR',
    banks: [
      { name: 'ACLEDA Bank', swift: 'ACLBKHPP' },
      { name: 'ABA Bank', swift: 'ABAAKMPP' },
      { name: 'Canadia Bank', swift: 'CNDAKHPP' },
    ],
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD',
    banks: [
      { name: 'Commonwealth Bank of Australia (CBA)', swift: 'CTBAAU2S' },
      { name: 'ANZ Bank', swift: 'ANZBAU3M' },
      { name: 'Westpac Bank', swift: 'WPACAU2S' },
      { name: 'NAB (National Australia Bank)', swift: 'NATAAU33' },
      { name: 'Macquarie Bank', swift: 'MACQAU2S' },
      { name: 'Bendigo Bank', swift: 'BENDAU3M' },
      { name: 'Bank of Queensland (BOQ)', swift: 'QBANAU4B' },
    ],
  },
  {
    code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD',
    banks: [
      { name: 'ANZ New Zealand', swift: 'ANZBNZ22' },
      { name: 'ASB Bank', swift: 'ASBBNZ2A' },
      { name: 'Bank of New Zealand (BNZ)', swift: 'BKNZNZ22' },
      { name: 'Westpac New Zealand', swift: 'WPACNZ2W' },
      { name: 'Kiwibank', swift: 'KIWINZ22' },
    ],
  },

  // ── EUROPE ───────────────────────────────────────────────────────────────
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP',
    banks: [
      { name: 'Barclays Bank', swift: 'BARCGB22' },
      { name: 'HSBC UK', swift: 'HBUKGB4B' },
      { name: 'Lloyds Bank', swift: 'LOYDGB2L' },
      { name: 'NatWest Bank', swift: 'NWBKGB2L' },
      { name: 'Santander UK', swift: 'ABBYGB2L' },
      { name: 'Halifax (HBOS)', swift: 'HLFXGB21' },
      { name: 'Standard Chartered UK', swift: 'SCBLGB2L' },
      { name: 'Metro Bank', swift: 'MYMBGB2L' },
      { name: 'Monzo Bank', swift: 'MONZGB2L' },
      { name: 'Revolut Bank UK', swift: 'REVOGB21' },
    ],
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR',
    banks: [
      { name: 'Deutsche Bank', swift: 'DEUTDEDB' },
      { name: 'Commerzbank', swift: 'COBADEFF' },
      { name: 'DZ Bank', swift: 'GENODEFF' },
      { name: 'UniCredit Bank AG (HypoVereinsbank)', swift: 'HYVEDEMMXXX' },
      { name: 'KfW Bank', swift: 'KFWIDEFF' },
      { name: 'Landesbank Baden-Württemberg (LBBW)', swift: 'SOLADEST' },
      { name: 'N26 Bank', swift: 'NTSBDEB1' },
    ],
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR',
    banks: [
      { name: 'BNP Paribas', swift: 'BNPAFRPP' },
      { name: 'Société Générale', swift: 'SOGEFRPP' },
      { name: 'Crédit Agricole', swift: 'AGRIFRPP' },
      { name: 'Crédit Mutuel', swift: 'CMCIFRPP' },
      { name: 'La Banque Postale', swift: 'PSSTFRPP' },
      { name: 'Banque Populaire', swift: 'CCBPFRPP' },
      { name: 'LCL (Le Crédit Lyonnais)', swift: 'CRLYFRPP' },
    ],
  },
  {
    code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR',
    banks: [
      { name: 'Intesa Sanpaolo', swift: 'BCITITMM' },
      { name: 'UniCredit', swift: 'UNCRITMM' },
      { name: 'Banca Monte dei Paschi di Siena', swift: 'PASCITMM' },
      { name: 'Banco BPM', swift: 'BAPPIT21' },
      { name: 'Mediobanca', swift: 'MEDIITMM' },
      { name: 'Poste Italiane (BancoPosta)', swift: 'BPPIITRRXXX' },
    ],
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR',
    banks: [
      { name: 'Banco Santander', swift: 'BSCHESMMXXX' },
      { name: 'BBVA', swift: 'BBVAESMMXXX' },
      { name: 'CaixaBank', swift: 'CAIXESBBXXX' },
      { name: 'Banco Sabadell', swift: 'BSABESBBXXX' },
      { name: 'Bankinter', swift: 'BKBKESMMXXX' },
      { name: 'Ibercaja', swift: 'CAZRES2Z' },
    ],
  },
  {
    code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR',
    banks: [
      { name: 'ING Bank', swift: 'INGBNL2A' },
      { name: 'ABN AMRO', swift: 'ABNANL2A' },
      { name: 'Rabobank', swift: 'RABONL2U' },
      { name: 'de Volksbank', swift: 'FVLBNL22' },
      { name: 'Triodos Bank', swift: 'TRIONL2U' },
      { name: 'Bunq Bank', swift: 'BUNQNL2A' },
    ],
  },
  {
    code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF',
    banks: [
      { name: 'UBS Switzerland', swift: 'UBSWCHZH' },
      { name: 'Credit Suisse', swift: 'CRESCHZZ' },
      { name: 'PostFinance', swift: 'POFICHBE' },
      { name: 'Raiffeisen Switzerland', swift: 'RAIFCH22' },
      { name: 'Zürcher Kantonalbank (ZKB)', swift: 'ZKBKCHZZ' },
    ],
  },
  {
    code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK',
    banks: [
      { name: 'Swedbank', swift: 'SWEDSESS' },
      { name: 'SEB (Skandinaviska Enskilda Banken)', swift: 'ESSESESS' },
      { name: 'Handelsbanken', swift: 'HANDSESS' },
      { name: 'Nordea Sweden', swift: 'NDEASESS' },
      { name: 'Danske Bank Sweden', swift: 'DABASESX' },
    ],
  },
  {
    code: 'NO', name: 'Norway', flag: '🇳🇴', currency: 'NOK',
    banks: [
      { name: 'DNB Bank', swift: 'DNBANOGG' },
      { name: 'Nordea Norway', swift: 'NDEANOKKXXX' },
      { name: 'SpareBank 1', swift: 'SPAVNO22' },
      { name: 'Handelsbanken Norway', swift: 'HANDNOKK' },
    ],
  },
  {
    code: 'DK', name: 'Denmark', flag: '🇩🇰', currency: 'DKK',
    banks: [
      { name: 'Danske Bank', swift: 'DABADKKK' },
      { name: 'Nordea Denmark', swift: 'NDEADKKK' },
      { name: 'Jyske Bank', swift: 'JYBADKKK' },
      { name: 'Sydbank', swift: 'SYBKDK22' },
    ],
  },
  {
    code: 'FI', name: 'Finland', flag: '🇫🇮', currency: 'EUR',
    banks: [
      { name: 'OP Financial Group', swift: 'OKOYFIHH' },
      { name: 'Nordea Finland', swift: 'NDEAFIHH' },
      { name: 'Handelsbanken Finland', swift: 'HANDFIHH' },
      { name: 'Aktia Bank', swift: 'HELSFIHH' },
    ],
  },
  {
    code: 'AT', name: 'Austria', flag: '🇦🇹', currency: 'EUR',
    banks: [
      { name: 'Erste Bank', swift: 'GIBAATWWXXX' },
      { name: 'Raiffeisen Bank International', swift: 'RZBAATWW' },
      { name: 'UniCredit Bank Austria', swift: 'BKAUATWW' },
      { name: 'BAWAG P.S.K.', swift: 'BAWAATWW' },
    ],
  },
  {
    code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR',
    banks: [
      { name: 'BNP Paribas Fortis', swift: 'GEBABEBB' },
      { name: 'KBC Bank', swift: 'KREDBEBB' },
      { name: 'Belfius Bank', swift: 'GKCCBEBB' },
      { name: 'ING Belgium', swift: 'BBRUBEBB' },
      { name: 'Argenta Bank', swift: 'ARSPBE22' },
    ],
  },
  {
    code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR',
    banks: [
      { name: 'Caixa Geral de Depósitos', swift: 'CGDIPTPL' },
      { name: 'BCP (Millennium bcp)', swift: 'BCOMPTPL' },
      { name: 'Novo Banco', swift: 'BESCPTPL' },
      { name: 'Santander Portugal', swift: 'BSCHPTPL' },
    ],
  },
  {
    code: 'GR', name: 'Greece', flag: '🇬🇷', currency: 'EUR',
    banks: [
      { name: 'National Bank of Greece', swift: 'ETHNGRAA' },
      { name: 'Alpha Bank', swift: 'CRBAGRAAXXX' },
      { name: 'Piraeus Bank', swift: 'PIRBGRAA' },
      { name: 'Eurobank', swift: 'ERBKGRAA' },
    ],
  },
  {
    code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN',
    banks: [
      { name: 'PKO Bank Polski', swift: 'BPKOPLPW' },
      { name: 'Bank Pekao', swift: 'PKOPPLPW' },
      { name: 'mBank', swift: 'BREXPLPW' },
      { name: 'ING Bank Śląski', swift: 'INGBPLPW' },
      { name: 'Santander Bank Polska', swift: 'WBKPPLPP' },
    ],
  },
  {
    code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', currency: 'CZK',
    banks: [
      { name: 'Česká spořitelna', swift: 'GIBACZPX' },
      { name: 'Komerční banka', swift: 'KOMBCZPP' },
      { name: 'CSOB (Ceskoslovenska obchodni banka)', swift: 'CEKOCZPP' },
      { name: 'Raiffeisenbank Czech', swift: 'RZBCCZPP' },
    ],
  },
  {
    code: 'HU', name: 'Hungary', flag: '🇭🇺', currency: 'HUF',
    banks: [
      { name: 'OTP Bank', swift: 'OTPVHUHB' },
      { name: 'K&H Bank', swift: 'OKHBHUHB' },
      { name: 'MBH Bank (Merged)', swift: 'BACXHUHB' },
      { name: 'Erste Bank Hungary', swift: 'GIBAHUHB' },
    ],
  },
  {
    code: 'RO', name: 'Romania', flag: '🇷🇴', currency: 'RON',
    banks: [
      { name: 'Banca Transilvania', swift: 'BTRLRO22' },
      { name: 'BCR (Banca Comerciala Romana)', swift: 'RNCBROBU' },
      { name: 'BRD (BRD-Groupe Société Générale)', swift: 'BRDEROBU' },
      { name: 'ING Bank Romania', swift: 'INGBROBU' },
    ],
  },
  {
    code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY',
    banks: [
      { name: 'Ziraat Bankası', swift: 'TCZBTR2A' },
      { name: 'İş Bankası (Isbank)', swift: 'ISBKTRIS' },
      { name: 'Garanti BBVA', swift: 'TGBATRIS' },
      { name: 'Akbank', swift: 'AKBKTRIS' },
      { name: 'Yapı Kredi Bank', swift: 'YAPITRIS' },
      { name: 'Halkbank', swift: 'TRHBTR2A' },
      { name: 'Vakıfbank', swift: 'TVBATR2A' },
    ],
  },
  {
    code: 'RU', name: 'Russia', flag: '🇷🇺', currency: 'RUB',
    banks: [
      { name: 'Sberbank', swift: 'SABRRUMM' },
      { name: 'VTB Bank', swift: 'VTBRRUMM' },
      { name: 'Gazprombank', swift: 'GAZPRUMM' },
      { name: 'Alfa-Bank Russia', swift: 'ALFARUMM' },
      { name: 'Tinkoff Bank', swift: 'TICSRUMM' },
    ],
  },
  {
    code: 'UA', name: 'Ukraine', flag: '🇺🇦', currency: 'UAH',
    banks: [
      { name: 'PrivatBank', swift: 'PBANUA2X' },
      { name: 'Oschadbank', swift: 'OSCHAUA2' },
      { name: 'Monobank', swift: 'UNBIUA2X' },
      { name: 'Raiffeisen Bank Ukraine', swift: 'AVALUAUK' },
    ],
  },

  // ── NORTH AMERICA ─────────────────────────────────────────────────────────
  {
    code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD',
    banks: [
      { name: 'JPMorgan Chase', swift: 'CHASUS33' },
      { name: 'Bank of America', swift: 'BOFAUS3N' },
      { name: 'Wells Fargo', swift: 'WFBIUS6S' },
      { name: 'Citibank', swift: 'CITIUS33' },
      { name: 'Goldman Sachs', swift: 'GOLDUS33' },
      { name: 'Morgan Stanley Bank', swift: 'MSNYUS33' },
      { name: 'U.S. Bank', swift: 'USBKUS44' },
      { name: 'Truist Bank', swift: 'BRBTUS33' },
      { name: 'Capital One', swift: 'HIBKUS44' },
      { name: 'PNC Bank', swift: 'PNCCUS33' },
      { name: 'TD Bank USA', swift: 'NRTHUS33' },
    ],
  },
  {
    code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD',
    banks: [
      { name: 'Royal Bank of Canada (RBC)', swift: 'ROYCCAT2' },
      { name: 'Toronto-Dominion Bank (TD)', swift: 'TDOMCATT' },
      { name: 'Bank of Nova Scotia (Scotiabank)', swift: 'NOSCCATT' },
      { name: 'Bank of Montreal (BMO)', swift: 'BOFMCAM2' },
      { name: 'CIBC', swift: 'CIBCCATT' },
      { name: 'National Bank of Canada', swift: 'BNDCCAMMINT' },
      { name: 'EQ Bank', swift: 'EQBKCATT' },
    ],
  },
  {
    code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN',
    banks: [
      { name: 'BBVA México', swift: 'BCMRMXMM' },
      { name: 'Banamex (Citigroup México)', swift: 'BNMXMXMM' },
      { name: 'Santander México', swift: 'BSMXMXMM' },
      { name: 'HSBC México', swift: 'BIMEMXMM' },
      { name: 'Banorte', swift: 'MENOMXMT' },
      { name: 'Scotiabank México', swift: 'MBCOMXMM' },
    ],
  },

  // ── LATIN AMERICA ─────────────────────────────────────────────────────────
  {
    code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL',
    banks: [
      { name: 'Banco do Brasil', swift: 'BRASBRRJ' },
      { name: 'Caixa Econômica Federal', swift: 'CEFXBRSP' },
      { name: 'Itaú Unibanco', swift: 'ITAUBRSP' },
      { name: 'Bradesco', swift: 'BBDEBRSP' },
      { name: 'Santander Brasil', swift: 'BSCHBRSP' },
      { name: 'BTG Pactual', swift: 'BTGPBRSP' },
      { name: 'Nubank', swift: 'NUPIBRSP' },
    ],
  },
  {
    code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS',
    banks: [
      { name: 'Banco Nación Argentina', swift: 'NACNARBAXXX' },
      { name: 'Banco Santander Río', swift: 'BSCHARBAXXX' },
      { name: 'BBVA Argentina', swift: 'FRANARBAXXX' },
      { name: 'Banco Galicia', swift: 'GAGLARBAXXX' },
      { name: 'Banco Macro', swift: 'BMAAARBA' },
    ],
  },
  {
    code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP',
    banks: [
      { name: 'Banco Estado', swift: 'BECHCLRM' },
      { name: 'Banco de Chile', swift: 'BCHICLRM' },
      { name: 'Banco Santander Chile', swift: 'BSCHCLRM' },
      { name: 'BCI (Banco de Crédito e Inversiones)', swift: 'CREDCLRM' },
      { name: 'Banco BICE', swift: 'BICECLRM' },
    ],
  },
  {
    code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP',
    banks: [
      { name: 'Bancolombia', swift: 'COLOCOBM' },
      { name: 'Banco de Bogotá', swift: 'BBOGCOBB' },
      { name: 'Davivienda', swift: 'CAFICOBB' },
      { name: 'BBVA Colombia', swift: 'GIROCOBBXXX' },
      { name: 'Banco Popular Colombia', swift: 'BPOPCOBB' },
    ],
  },
  {
    code: 'PE', name: 'Peru', flag: '🇵🇪', currency: 'PEN',
    banks: [
      { name: 'BCP (Banco de Crédito del Perú)', swift: 'BCPLPEPL' },
      { name: 'BBVA Perú', swift: 'BCONPEPL' },
      { name: 'Interbank Peru', swift: 'IBPEPEPL' },
      { name: 'Scotiabank Perú', swift: 'NOSCPEPL' },
    ],
  },

  // ── MIDDLE EAST ───────────────────────────────────────────────────────────
  {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED',
    banks: [
      { name: 'Emirates NBD', swift: 'EBILAEAD' },
      { name: 'First Abu Dhabi Bank (FAB)', swift: 'NBADAEAA' },
      { name: 'Abu Dhabi Commercial Bank (ADCB)', swift: 'ADCBAEAA' },
      { name: 'Dubai Islamic Bank (DIB)', swift: 'DUIBAEAD' },
      { name: 'Mashreq Bank', swift: 'BOMLAEAD' },
      { name: 'HSBC UAE', swift: 'HSBCAEAD' },
      { name: 'Commercial Bank of Dubai', swift: 'CBDUAEAD' },
    ],
  },
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR',
    banks: [
      { name: 'Al Rajhi Bank', swift: 'RJHISARI' },
      { name: 'National Commercial Bank (NCB/SNB)', swift: 'NCBKSAJE' },
      { name: 'Riyad Bank', swift: 'RIBLSARI' },
      { name: 'Saudi British Bank (SABB)', swift: 'SABBSARI' },
      { name: 'Bank Al-Jazira', swift: 'BJAZSAJE' },
      { name: 'Banque Saudi Fransi', swift: 'BSFRSARI' },
    ],
  },
  {
    code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR',
    banks: [
      { name: 'Qatar National Bank (QNB)', swift: 'QNBAQAQA' },
      { name: 'Commercial Bank of Qatar', swift: 'CBQAQAQA' },
      { name: 'Doha Bank', swift: 'DOHBQAQA' },
      { name: 'Qatar Islamic Bank (QIB)', swift: 'QISB QAQA' },
    ],
  },
  {
    code: 'KW', name: 'Kuwait', flag: '🇰🇼', currency: 'KWD',
    banks: [
      { name: 'National Bank of Kuwait (NBK)', swift: 'NBOKKWKW' },
      { name: 'Kuwait Finance House (KFH)', swift: 'KFHOKWKW' },
      { name: 'Gulf Bank Kuwait', swift: 'GULBKWKW' },
      { name: 'Boubyan Bank', swift: 'BOUBKWKW' },
    ],
  },
  {
    code: 'BH', name: 'Bahrain', flag: '🇧🇭', currency: 'BHD',
    banks: [
      { name: 'National Bank of Bahrain (NBB)', swift: 'NBOBBHBM' },
      { name: 'Bank of Bahrain and Kuwait (BBK)', swift: 'BBKUBHBM' },
      { name: 'Ahli United Bank Bahrain', swift: 'AUBBBHBM' },
      { name: 'Ithmaar Bank', swift: 'FUIBBHBM' },
    ],
  },
  {
    code: 'OM', name: 'Oman', flag: '🇴🇲', currency: 'OMR',
    banks: [
      { name: 'Bank Muscat', swift: 'BMUSOM RX' },
      { name: 'National Bank of Oman (NBO)', swift: 'NBOMOMRX' },
      { name: 'BankDhofar', swift: 'BKDBOMRX' },
      { name: 'HSBC Oman', swift: 'HSBCOMRX' },
    ],
  },
  {
    code: 'JO', name: 'Jordan', flag: '🇯🇴', currency: 'JOD',
    banks: [
      { name: 'Arab Bank', swift: 'ARABJOAX' },
      { name: 'Bank of Jordan', swift: 'BOJOJO11' },
      { name: 'Jordan Ahli Bank', swift: 'AHLIJOJA' },
      { name: 'Capital Bank Jordan', swift: 'ISCBJOAX' },
    ],
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP',
    banks: [
      { name: 'National Bank of Egypt (NBE)', swift: 'NBEGEGCX' },
      { name: 'Banque Misr', swift: 'BMISEGCX' },
      { name: 'Commercial International Bank (CIB)', swift: 'CIBEEGCX' },
      { name: 'QNB Al Ahli', swift: 'QNBAEGCX' },
      { name: 'Banque du Caire', swift: 'BDCAEGCX' },
    ],
  },
  {
    code: 'IL', name: 'Israel', flag: '🇮🇱', currency: 'ILS',
    banks: [
      { name: 'Bank Hapoalim', swift: 'POALILIT' },
      { name: 'Bank Leumi', swift: 'LUMIILIT' },
      { name: 'Discount Bank', swift: 'DISCILIT' },
      { name: 'Mizrahi Tefahot Bank', swift: 'MIZBILIT' },
    ],
  },

  // ── AFRICA ────────────────────────────────────────────────────────────────
  {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR',
    banks: [
      { name: 'Standard Bank South Africa', swift: 'SBZAZAJJ' },
      { name: 'FirstRand Bank (FNB)', swift: 'FIRNZAJJ' },
      { name: 'Absa Bank', swift: 'ABSAZAJJ' },
      { name: 'Nedbank', swift: 'NEDZAJJJ' },
      { name: 'Capitec Bank', swift: 'CABLZAJJ' },
      { name: 'Investec Bank South Africa', swift: 'INVZZAJJ' },
    ],
  },
  {
    code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN',
    banks: [
      { name: 'Access Bank Nigeria', swift: 'ABNGNGLA' },
      { name: 'Zenith Bank', swift: 'ZEIBNGLA' },
      { name: 'GTBank (Guaranty Trust Bank)', swift: 'GTBINGLA' },
      { name: 'United Bank for Africa (UBA)', swift: 'UNAFNGLA' },
      { name: 'First Bank of Nigeria', swift: 'FBNINGLA' },
      { name: 'Stanbic IBTC Bank', swift: 'SBICNGLA' },
    ],
  },
  {
    code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES',
    banks: [
      { name: 'Equity Bank Kenya', swift: 'EQBLKENA' },
      { name: 'Kenya Commercial Bank (KCB)', swift: 'KCBLKENA' },
      { name: 'Standard Chartered Kenya', swift: 'SCBLKENA' },
      { name: 'Cooperative Bank of Kenya', swift: 'COOPKENA' },
      { name: 'Absa Bank Kenya', swift: 'BARCKENX' },
    ],
  },
  {
    code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS',
    banks: [
      { name: 'GCB Bank', swift: 'GHCBGHAC' },
      { name: 'Ecobank Ghana', swift: 'ECOCGHAC' },
      { name: 'Stanbic Bank Ghana', swift: 'SBICGHAC' },
      { name: 'Absa Bank Ghana', swift: 'BARCGHAC' },
    ],
  },
  {
    code: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS',
    banks: [
      { name: 'CRDB Bank', swift: 'CORUTZTZ' },
      { name: 'NMB Bank Tanzania', swift: 'NMIBTZTZ' },
      { name: 'Equity Bank Tanzania', swift: 'EQBLTZTZ' },
      { name: 'Standard Chartered Tanzania', swift: 'SCBLTZTZ' },
    ],
  },
  {
    code: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB',
    banks: [
      { name: 'Commercial Bank of Ethiopia (CBE)', swift: 'CBETETAA' },
      { name: 'Awash Bank', swift: 'AWSHETET' },
      { name: 'Dashen Bank', swift: 'DASHETAA' },
    ],
  },
  {
    code: 'SN', name: 'Senegal', flag: '🇸🇳', currency: 'XOF',
    banks: [
      { name: 'CBAO (Compagnie Bancaire de l\'Afrique)', swift: 'CBAOSNDA' },
      { name: 'Ecobank Senegal', swift: 'ECOC SNDA' },
      { name: 'Société Générale Sénégal', swift: 'SOGESENX' },
    ],
  },

  // ── MORE REGIONS ──────────────────────────────────────────────────────────
  {
    code: 'MA', name: 'Morocco', flag: '🇲🇦', currency: 'MAD',
    banks: [
      { name: 'Attijariwafa Bank', swift: 'BCMAMAMC' },
      { name: 'Banque Populaire Maroc', swift: 'CHAAMAMC' },
      { name: 'CIH Bank', swift: 'CIHAMAMC' },
      { name: 'BMCE Bank (Bank of Africa)', swift: 'BMCEAMAMC' },
    ],
  },
  {
    code: 'TN', name: 'Tunisia', flag: '🇹🇳', currency: 'TND',
    banks: [
      { name: 'Banque Nationale Agricole (BNA)', swift: 'BNANTNTX' },
      { name: 'Société Tunisienne de Banque (STB)', swift: 'STBETNTX' },
      { name: 'Amen Bank', swift: 'AMENBTTX' },
    ],
  },
  {
    code: 'ZM', name: 'Zambia', flag: '🇿🇲', currency: 'ZMW',
    banks: [
      { name: 'Zambia National Commercial Bank (Zanaco)', swift: 'ZNCOZML1' },
      { name: 'Standard Chartered Zambia', swift: 'SCBLZMLU' },
      { name: 'Stanbic Bank Zambia', swift: 'SBICZML1' },
    ],
  },
  {
    code: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX',
    banks: [
      { name: 'Stanbic Bank Uganda', swift: 'SBICUGUN' },
      { name: 'Centenary Bank Uganda', swift: 'CENBUGKA' },
      { name: 'DFCU Bank Uganda', swift: 'DFCUUGKA' },
    ],
  },
  {
    code: 'CM', name: 'Cameroon', flag: '🇨🇲', currency: 'XAF',
    banks: [
      { name: 'Afriland First Bank', swift: 'CCEICMCX' },
      { name: 'Société Générale Cameroun', swift: 'SOGECMCX' },
      { name: 'Ecobank Cameroon', swift: 'ECOCKMCX' },
    ],
  },

  // ── CARIBBEAN & PACIFIC ISLANDS ───────────────────────────────────────────
  {
    code: 'JM', name: 'Jamaica', flag: '🇯🇲', currency: 'JMD',
    banks: [
      { name: 'National Commercial Bank (NCB) Jamaica', swift: 'NCBLJMKX' },
      { name: 'Scotia Jamaica', swift: 'NOSCJMKX' },
      { name: 'Bank of Nova Scotia Jamaica', swift: 'BNOSKLKX' },
    ],
  },
  {
    code: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹', currency: 'TTD',
    banks: [
      { name: 'Republic Bank Trinidad', swift: 'RBTTTTPS' },
      { name: 'First Citizens Bank', swift: 'FCBKTTPS' },
      { name: 'Scotiabank Trinidad', swift: 'NOSCTTTPS' },
    ],
  },
  {
    code: 'FJ', name: 'Fiji', flag: '🇫🇯', currency: 'FJD',
    banks: [
      { name: 'ANZ Fiji', swift: 'ANZBFJFX' },
      { name: 'BSP (Bank of South Pacific) Fiji', swift: 'BOSPFJFJ' },
      { name: 'Westpac Fiji', swift: 'WPACFJFX' },
    ],
  },
  {
    code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬', currency: 'PGK',
    banks: [
      { name: 'BSP (Bank South Pacific)', swift: 'BOSPPPPM' },
      { name: 'ANZ Papua New Guinea', swift: 'ANZBPGPM' },
      { name: 'Westpac PNG', swift: 'WPACPGPM' },
    ],
  },

  // ── MORE EUROPEAN & CIS ───────────────────────────────────────────────────
  {
    code: 'HR', name: 'Croatia', flag: '🇭🇷', currency: 'EUR',
    banks: [
      { name: 'Zagrebačka Banka (Zaba)', swift: 'ZABAHR2X' },
      { name: 'Privredna Banka Zagreb (PBZ)', swift: 'PBZGHR2X' },
      { name: 'Erste Bank Croatia', swift: 'ESBCHR22' },
    ],
  },
  {
    code: 'SK', name: 'Slovakia', flag: '🇸🇰', currency: 'EUR',
    banks: [
      { name: 'Slovenská sporiteľňa', swift: 'GIBASKBX' },
      { name: 'VÚB Banka', swift: 'SUBASKBX' },
      { name: 'Tatra Banka', swift: 'TATRSKBX' },
    ],
  },
  {
    code: 'BG', name: 'Bulgaria', flag: '🇧🇬', currency: 'BGN',
    banks: [
      { name: 'UniCredit Bulbank', swift: 'UNCRBGSF' },
      { name: 'DSK Bank', swift: 'STSABGSF' },
      { name: 'First Investment Bank (FIB)', swift: 'FINVBGSF' },
    ],
  },
  {
    code: 'RS', name: 'Serbia', flag: '🇷🇸', currency: 'RSD',
    banks: [
      { name: 'Banca Intesa Serbia', swift: 'DBDBRSBG' },
      { name: 'Komercijalna Banka', swift: 'KOBBRSBG' },
      { name: 'Raiffeisen Banka Serbia', swift: 'RZBSRSBG' },
    ],
  },
  {
    code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT',
    banks: [
      { name: 'Halyk Bank', swift: 'HSBKKZKX' },
      { name: 'Kaspi Bank', swift: 'CASPKZKA' },
      { name: 'Jusan Bank', swift: 'ATFBKZKX' },
      { name: 'Freedom Bank Kazakhstan', swift: 'FCBKKZKA' },
    ],
  },
  {
    code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS',
    banks: [
      { name: 'Asaka Bank', swift: 'ASAKUZ22' },
      { name: 'Ipoteka-Bank', swift: 'UZIPUZ22' },
      { name: 'Kapitalbank', swift: 'KAPBUZ22' },
    ],
  },
];

/**
 * Flatten all banks into a single searchable array.
 * Each item: { bankName, countryCode, countryName, flag, currency, swift }
 */
const FLAT_BANK_LIST = GLOBAL_BANKS.flatMap(({ code, name, flag, currency, banks }) =>
  banks.map(b => ({
    bankName:    b.name,
    countryCode: code,
    countryName: name,
    flag,
    currency,
    swift:       b.swift || '',
    searchKey:   `${b.name} ${name} ${code} ${b.swift || ''}`.toLowerCase(),
  }))
);

module.exports = { GLOBAL_BANKS, FLAT_BANK_LIST };
