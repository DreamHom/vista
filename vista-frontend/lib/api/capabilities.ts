export const BACKEND_CAPABILITIES = {
  listings: {
    browse: true,
    ownedListView: false,
    listingOffersFeed: false,
    listingInspectionFeed: false,
  },
  saves: {
    mine: true,
  },
  offers: {
    submit: true,
    respond: true,
    counter: true,
    myFeed: false,
    listingFeed: false,
  },
  inspections: {
    createSlot: true,
    listSlots: true,
    request: true,
    myFeed: false,
    listingFeed: false,
  },
  notifications: {
    inbox: true,
    unreadCount: true,
    markRead: true,
  },
  reviews: {
    submit: true,
    delete: true,
    listingFeed: true,
    userFeed: true,
  },
  admin: {
    analytics: true,
    listingModeration: true,
    verificationQueue: true,
    userDirectory: false,
    auditLog: false,
  },
  messages: {
    conversations: false,
  },
  users: {
    publicProfile: true,
    agentDirectory: false,
  },
} as const;
