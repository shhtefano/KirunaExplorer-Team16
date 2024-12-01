-- SQLite
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Geolocation;
DROP TABLE IF EXISTS Documents;
DROP TABLE IF EXISTS Geolocation_Documents;
DROP TABLE IF EXISTS OriginalResources;
DROP TABLE IF EXISTS Stakeholders;
DROP TABLE IF EXISTS Document_Stakeholder;
DROP TABLE IF EXISTS Stakeholder;
DROP TABLE IF EXISTS DocumentTypes;
DROP TABLE IF EXISTS Type;




CREATE TABLE "Attachments" (
	"file_name"	VARCHAR(255),
	"document_id"	INTEGER NOT NULL,
	PRIMARY KEY("file_name","document_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Connections" (
	"parent_id"	INTEGER,
	"children_id"	INTEGER,
	"connection_type"	VARCHAR(50),
	PRIMARY KEY("parent_id","children_id"),
	FOREIGN KEY("parent_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("children_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("parent_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE,
	FOREIGN KEY("children_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Document_Stakeholder" (
	"stakeholder_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	"id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("stakeholder_id") REFERENCES "Stakeholders"("stakeholder_id"),
	UNIQUE("document_id","stakeholder_id")
);

CREATE TABLE "Documents" (
	"document_id"	INTEGER,
	"document_title"	VARCHAR(255) NOT NULL,
	"scale"	VARCHAR(50) NOT NULL,
	"issuance_date"	DATE NOT NULL,
	"language"	VARCHAR(50),
	"pages"	INT,
	"document_type"	VARCHAR(50) NOT NULL,
	"document_description"	TEXT NOT NULL,
	PRIMARY KEY("document_id" AUTOINCREMENT)
    FOREIGN KEY ("document_type") REFERENCES "Type"("type_name")
	);

CREATE TABLE "Geolocation" (
	"area_id"	INTEGER NOT NULL,
	"long"	REAL NOT NULL,
	"lat"	REAL NOT NULL,
	"area_name"	TEXT NOT NULL DEFAULT ' '
);

CREATE TABLE "Geolocation_Documents" (
	"area_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	PRIMARY KEY("area_id","document_id"),
	FOREIGN KEY("area_id") REFERENCES "Geolocation"("area_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "OriginalResources" (
	"file_name"	VARCHAR(255) NOT NULL,
	"document_id"	INTEGER NOT NULL,
	PRIMARY KEY("file_name","document_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Stakeholders" (
	"stakeholder_id"	INTEGER,
	"stakeholder_name"	INTEGER NOT NULL,
	PRIMARY KEY("stakeholder_id" AUTOINCREMENT)
);
CREATE TABLE "Type" (
	"type_id"	INTEGER,
	"type_name"	VARCHAR(50) NOT NULL,
	PRIMARY KEY("type_id" AUTOINCREMENT)
);

INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(1, 'LKAB');
INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(2, 'Citizens');

INSERT INTO Documents(document_id, document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES (1, 'Kiruna buildings', '1:100', '2012', 'Swedish', 10, 'Informative', 'description');
INSERT INTO Documents(document_id, document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES (2, 'Kiruna workshops', '1:1000', '2012/12/25', 'English', 10, 'Material Effects', 'description');
INSERT INTO Documents(document_id, document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES (3, 'Municipal permission', 'Blueprint', '2012', 'Swedish', 10, 'Informative', 'description');
INSERT INTO Documents(document_id, document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES (4, 'Mines work', '1:1000', '2012', 'English', 10, 'Material Effects', 'description');

INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,1);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(2,1);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,2);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,3);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(2,4);

INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,20.198879 ,67.864354, 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,20.198879 ,67.845556 , 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,20.28059 , 67.840539 , 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(0,20.304966, 67.864871, 'Whole Area');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(1,20.392263, 67.847947, 'Point-Based Documents');
INSERT INTO Geolocation(area_id, long, lat, area_name) VALUES(2,20.192263, 67.737947, 'Point-Based Documents');

INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(0, 1);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(0, 2);

INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 3);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(2, 4);


INSERT INTO Type (type_name) VALUES ('Design');
INSERT INTO Type (type_name) VALUES ('Informative');
INSERT INTO Type (type_name) VALUES ('Technical');
INSERT INTO Type (type_name) VALUES ('Prescriptive');
INSERT INTO Type (type_name) VALUES ('Material Effects');
INSERT INTO Type (type_name) VALUES ('Agreement');
INSERT INTO Type (type_name) VALUES ('Conflict');
INSERT INTO Type (type_name) VALUES ('Consultation');
