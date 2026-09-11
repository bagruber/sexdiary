/**
 * Der Name, den die App im Betriebssystem traegt, und der, den sie sich
 * selbst gibt.
 *
 * Auf dem Startbildschirm und im Sperrbildschirm steht "Journal" — nicht
 * erst im Tarnmodus, sondern immer. Diskretion ist bei diesem Produkt
 * der Normalfall, und ein Name, der erst auf Knopfdruck harmlos wird,
 * schuetzt genau in dem Moment nicht, in dem niemand den Knopf gedrueckt
 * hat.
 *
 * In der App selbst steht der richtige Name, solange der Tarnmodus aus
 * ist: wer sie geoeffnet hat, weiss ohnehin, was sie ist.
 *
 * Das Icon bleibt vorerst das eigene. Es zur Laufzeit zu wechseln geht
 * auf Android nur ueber activity-alias und eine weitere Abhaengigkeit;
 * das ist als eigener Punkt notiert.
 */
export const APP_NAME = "Sexdiary";

/** Wie die App im Betriebssystem heisst. Siehe app.json, expo.name. */
export const OS_NAME = "Journal";
