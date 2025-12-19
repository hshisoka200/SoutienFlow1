export const DEFAULT_PRICING: Record<string, Record<string, number>> = {
    'Maths': {
        '2BAC': 200, '1BAC': 150, 'Tronc Commun': 150,
        '3AC': 150, '2AC': 150, '1AC': 150,
        '6AP': 150, '5AP': 100, '4AP': 100, '3AP': 100, '2AP': 100, '1AP': 100
    },
    'Physics': {
        '2BAC': 200, '1BAC': 150, 'Tronc Commun': 150,
        '3AC': 100, '2AC': 100, '1AC': 100,
        '6AP': 100, '5AP': 100, '4AP': 100, '3AP': 100, '2AP': 100, '1AP': 100
    },
    'PC': {
        '2BAC': 200, '1BAC': 200, 'Tronc Commun': 150,
        '3AC': 150, '2AC': 100, '1AC': 100
    },
    'SVT': {
        '2BAC': 200, '1BAC': 200, 'Tronc Commun': 150,
        '3AC': 150
    },
    'Anglais': {
        '2BAC': 150, '1BAC': 150, 'Tronc Commun': 150,
        '3AC': 150, 'default': 100
    },
    'Français': {
        '2BAC': 150, '1BAC': 150, 'Tronc Commun': 150,
        '3AC': 150, 'default': 100
    },
    'Arabe': {
        'default': 100
    },
    'Philo': {
        '2BAC': 150, '1BAC': 100
    },
    'H-G': {
        'default': 100
    }
};

export const getPriceForSubject = (subject: string, level: string): number => {
    const subjectConfig = DEFAULT_PRICING[subject];
    if (!subjectConfig) return 100; // Default fallback

    return subjectConfig[level] || subjectConfig['default'] || 150;
};
