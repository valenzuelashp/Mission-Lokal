type ContactCard = {
    name: string;
    role?: string;
    phone: string;
};

function escapeVCard(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\n|\r/g, '\\n')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;');
}

export function contactCardFile(contact: ContactCard): string {
    const phone = contact.phone.replace(/[^\d+]/g, '');
    const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escapeVCard(contact.name || 'Barangay contact')}`,
        contact.role ? `TITLE:${escapeVCard(contact.role)}` : '',
        `TEL;TYPE=CELL:${phone || contact.phone}`,
        'END:VCARD',
    ].filter(Boolean);

    return lines.join('\r\n');
}

export function downloadContactCard(contact: ContactCard): void {
    const card = contactCardFile(contact);
    const blob = new Blob([card], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `${(contact.name || 'contact').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')}.vcf`;

    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
