CREATE DATABASE OPRS;
USE OPRS;

CREATE TABLE user(
    userId SERIAL PRIMARY KEY,
	fullName VARCHAR(100) NOT NULL,
	gender VARCHAR(6) NOT NULL,
	phoneNumber VARCHAR(20) NOT NULL,
    dateOfBirth VARCHAR(64) NOT NULL,
	email VARCHAR(128) NOT NULL,
    zone VARCHAR(64) NOT NULL,
	woreda VARCHAR(64) NOT NULL,
	dateJoined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	accountStatus VARCHAR(64) DEFAULT 'inactive',
	region VARCHAR(64) NOT NULL,
    jobType VARCHAR(64) NOT NULL,
    idType VARCHAR(64) NOT NULL,
    idNumber VARCHAR(64) NOT NULL,
    citizenship VARCHAR(64) NOT NULL,
    idPhotoUrl TEXT NOT NULL,
    role VARCHAR(64) DEFAULT 'tenant',
	married BOOL NOT NULL
);

ALTER TABLE user ADD CONSTRAINT emailConstraint UNIQUE(email);

CREATE TABLE userAuth(
	userId BIGINT UNSIGNED PRIMARY KEY,
	authString VARCHAR(128) NOT NULL,
	foreign key (userId) references user(userId) on delete CASCADE on update CASCADE
);

CREATE TABLE session(
    sessionId VARCHAR(128) NOT NULL PRIMARY KEY,
    userId BIGINT UNSIGNED,
    role INTEGER,
    userAgent TEXT NOT NULL,
    userIp VARCHAR(64) NOT NULL DEFAULT 'UNDEFINED',
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId) on delete CASCADE on update CASCADE
);


CREATE TABLE verificationKeys (
    verificationId SERIAL PRIMARY KEY,
    userId BIGINT UNSIGNED,
    verificationKey INT NOT NULL,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId) on delete CASCADE on update CASCADE
);

CREATE TABLE listing(
    listingId SERIAL PRIMARY KEY,
    ownerId BIGINT UNSIGNED,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    subCity VARCHAR(20) NOT NULL,
    woreda VARCHAR(20) NOT NULL,
    areaName VARCHAR(64) NOT NULL,
    latitude VARCHAR(200) NOT NULL,
    longitude VARCHAR(200) NOT NULL,
    pricePerDuration DECIMAL(10,2) NOT NULL,
    paymentCurrency VARCHAR(10) NOT NULL,
    taxResponsibility VARCHAR(64) NOT NULL,
    buildingName VARCHAR(64) NOT NULL,
    dateCreated VARCHAR(64) NOT NULL,
    furnished VARCHAR(10) NOT NULL,
    totalAreaSquareMeter INTEGER NOT NULL,
    listingStatus INTEGER NOT NULL DEFAULT 'active',
    distanceFromRoadM INTEGER DEFAULT 0,
    customerServiceDesks INTEGER DEFAULT 0,
    leaseDurationDays INTEGER DEFAULT 0,
    numberOfBathrooms INTEGER DEFAULT 0,
    numberOfBedrooms INTEGER DEFAULT 0,
    numberOfKitchens INTEGER DEFAULT 0,
    securityGuards INTEGER DEFAULT 0,
    cateringRooms INTEGER DEFAULT 0,
    floorNumber INTEGER DEFAULT 0,
    backStages INTEGER DEFAULT 0,
    backrooms INTEGER DEFAULT 0,
    displays INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    storageCapacitySqm INTEGER DEFAULT 0,
    parkingCapacity INTEGER DEFAULT 0,
    ceilingHeightM INTEGER DEFAULT 0,
    numberOfFloors INTEGER DEFAULT 0,
    loadingDocks INTEGER DEFAULT 0,
    guestCapacity INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE amenities(
    id SERIAL PRIMARY KEY,
    listingId BIGINT UNSIGNED,
    name VARCHAR(64) NOT NULL,
    FOREIGN KEY (listingId) REFERENCES listing(listingId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE additionalDescriptions(
    id SERIAL PRIMARY KEY,
    listingId BIGINT UNSIGNED,
    term VARCHAR(64) NOT NULL,
    FOREIGN KEY (listingId) REFERENCES listing(listingId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE listingPhotos(
    id SERIAL PRIMARY KEY,
    listingId BIGINT UNSIGNED,
    url TEXT NOT NULL,
    FOREIGN KEY (listingId) REFERENCES listing(listingId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE userPhotos(
    id SERIAL PRIMARY KEY,
    userId BIGINT UNSIGNED,
    url TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE contactInfo(
    id SERIAL PRIMARY KEY,
    userId	 BIGINT UNSIGNED,
    contactName VARCHAR(64) NOT NULL,
    contactAddress TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reviews(
    reviewId SERIAL PRIMARY KEY,
    authorId BIGINT UNSIGNED,
    authorName VARCHAR(64) NOT NULL,
    receiverId BIGINT UNSIGNED,
    reviewedListingId BIGINT UNSIGNED,
    reviewMessage TEXT NOT NULL,
    rating FLOAT NOT NULL,
    reviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiverId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (authorId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE paymentInfo(
    id SERIAL PRIMARY KEY,
    userId BIGINT UNSIGNED,
    subaccountId VARCHAR(64) NOT NULL,
    accountNumber VARCHAR(64) NOT NULL,
    businessName VARCHAR(128) NOT NULL,
    accountOwnerName VARCHAR(64) NOT NULL,
    bankId VARCHAR(128) NOT NULL,
    bankName VARCHAR(64) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE paymentreference(
    id SERIAL PRIMARY KEY,
    tenantId BIGINT UNSIGNED NOT NULL,
    ownerId BIGINT UNSIGNED NOT NULL,
    firstName VARCHAR(64),
    lastName VARCHAR(64),
    email VARCHAR(128),
    currency VARCHAR(10),
    amount DECIMAL(10,2),
    charge DECIMAL(10,2),
    mode VARCHAR(8),
    method VARCHAR(32),
    type VARCHAR(32),
    status VARCHAR(64),
    txref VARCHAR(32) NOT NULL,
    reference VARCHAR(64),
    title VARCHAR(32),
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ownerId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reservation(
    reservationId SERIAL PRIMARY KEY,
    tenantId BIGINT UNSIGNED,
    ownerId BIGINT UNSIGNED,
    listingId BIGINT UNSIGNED,
    additionalMessage TEXT,
    status INTEGER DEFAULT 'pending',
    selectedPaymentMethod VARCHAR(64) NOT NULL,
    priceOffer INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenantId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ownerId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE stayDates(
    id SERIAL PRIMARY KEY,
    reservationId BIGINT UNSIGNED,
    stayDate DATETIME NOT NULL,
    FOREIGN KEY (reservationId) REFERENCES reservation(reservationId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE agreement(
    agreementId SERIAL PRIMARY KEY,
    tenantId BIGINT UNSIGNED,
    ownerId BIGINT UNSIGNED,
    listingId BIGINT UNSIGNED,    
    agreementStatus INTEGER NOT NULL DEFAULT 'active',
    leaseStartDate BIGINT UNSIGNED NOT NULL,
    leaseEndDate BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tenantId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notification(
    notificationId SERIAL PRIMARY KEY,
    initiatorId BIGINT UNSIGNED,
    receiverId BIGINT UNSIGNED,
    type VARCHAR(16) NOT NULL,
    title VARCHAR(32) NOT NULL,
    body TEXT NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiatorId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE passwords(
    id SERIAL PRIMARY KEY,
    userId BIGINT UNSIGNED,
    pass VARCHAR(32) NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(userId) ON DELETE CASCADE ON UPDATE CASCADE
);