export const courses = [
    {
        id: "krav-maga",
        title: "Krav Maga: Defensa Personal Intensiva",
        description: "Curso de defensa personal para cualquier nivel, útil para diferentes situaciones",
        longDescription: `Este curso intensivo de Krav Maga está diseñado para que cualquier persona, 
    sin importar su nivel de experiencia previa, pueda aprender a defenderse de manera eficaz. 
    A lo largo de las secciones, practicarás técnicas reales de defensa personal utilizadas 
    por fuerzas de seguridad en todo el mundo, con un enfoque práctico y directo. 
    Además, contarás con ejercicios guiados, simulaciones de escenarios cotidianos y consejos 
    para aumentar tu seguridad personal en la vida diaria.`,
        image: "/assets/foto-curso-krav-maga.png",
        price: "59,99",
        topics: ["Golpes básicos", "Defensas", "Simulaciones"],
        updated_at: "2024-06-15",
        created_at: "2023-10-01",
        isSubtitled: true,
        language: "Español",
        includes: [
            "10 horas de video a tu ritmo",
            "Acceso de por vida al contenido",
            "Ejercicios prácticos paso a paso",
            "Material descargable en PDF",
            "Certificado de finalización",
            "Consejos de seguridad en situaciones reales"
        ],
        requirements: [
            "Ropa cómoda para entrenar",
            "Espacio libre para moverse",
            "Disposición para practicar técnicas de defensa personal"
        ],
        whatYouWillLearn: [
            "Técnicas de defensa contra ataques comunes",
            "Cómo reaccionar ante situaciones de riesgo",
            "Desarrollar confianza y control corporal",
            "Uso de la fuerza proporcional",
            "Simulaciones de escenarios reales"
        ],
        content: [
            {
                sectionTitle: "Fundamentos",
                classes: [
                    { title: "Introducción al Krav Maga", duration: { hours: 0, minutes: 30 } },
                    { title: "Postura y movimiento básico", duration: { hours: 0, minutes: 45 } },
                    { title: "Golpes básicos", duration: { hours: 1, minutes: 0 } }
                ]
            },
            {
                sectionTitle: "Defensas personales",
                classes: [
                    { title: "Defensa contra agarres", duration: { hours: 1, minutes: 15 } },
                    { title: "Defensa contra ataques con puños", duration: { hours: 1, minutes: 30 } },
                    { title: "Defensa contra ataques con objetos", duration: { hours: 1, minutes: 0 } }
                ]
            },
            {
                sectionTitle: "Simulaciones y práctica",
                classes: [
                    { title: "Simulación 1: calle", duration: { hours: 1, minutes: 0 } },
                    { title: "Simulación 2: transporte público", duration: { hours: 0, minutes: 50 } }
                ]
            }
        ],
        rating: 4.6,
        reviews: 120,
        userReviews: [
            { name: "Ana García", rating: 5, comment: "Excelente curso, muy completo y práctico." },
            { name: "Luis Pérez", rating: 4, comment: "Me gustó mucho, pero algunos ejercicios son difíciles sin guía." },
            { name: "Marta López", rating: 5, comment: "Muy recomendado para principiantes y avanzados." },
            { name: "Carlos Ruiz", rating: 4, comment: "" },
            { name: "Elena Torres", rating: 3, comment: "Buen contenido, pero esperaba más ejemplos de situaciones reales." }
        ]
    },
    {
        id: "sprays",
        title: "Uso Seguro y Eficaz de Sprays de Defensa",
        description: "Aprende a usar sprays de defensa correctamente",
        longDescription: `En este curso aprenderás a manejar sprays de defensa personal 
    de manera segura, legal y eficaz. Está diseñado para quienes buscan una herramienta 
    de protección adicional sin necesidad de experiencia previa. Incluye explicación 
    de la normativa vigente, demostraciones prácticas y recomendaciones para un uso 
    responsable en situaciones reales.`,
        image: "/assets/foto-curso-gas-pimienta.png",
        price: "49,99",
        topics: ["Tipos de sprays", "Legislación", "Prácticas seguras"],
        updated_at: "2024-06-15",
        created_at: "2023-10-01",
        isSubtitled: true,
        language: "Español",
        includes: [
            "3 horas de video explicativo",
            "Acceso de por vida al contenido",
            "Prácticas seguras y simulaciones",
            "Guía PDF de legislación vigente",
            "Certificado de finalización",
            "Recomendaciones de almacenamiento y transporte seguro"
        ],
        requirements: [
            "Spray de defensa (opcional si quieres practicar con tu propio equipo)",
            "Espacio seguro para entrenar",
            "Disposición para aprender normas de seguridad"
        ],
        whatYouWillLearn: [
            "Manejo correcto y seguro del spray",
            "Tipos de situaciones donde usarlo",
            "Conocer la legislación vigente",
            "Simulaciones de defensa personal",
            "Cómo desescalar conflictos"
        ],
        content: [
            {
                sectionTitle: "Introducción al spray",
                classes: [
                    { title: "Tipos de sprays", duration: { hours: 0, minutes: 20 } },
                    { title: "Cómo elegir el adecuado", duration: { hours: 0, minutes: 15 } }
                ]
            },
            {
                sectionTitle: "Uso seguro",
                classes: [
                    { title: "Posición y agarre", duration: { hours: 0, minutes: 30 } },
                    { title: "Técnicas de dispersión", duration: { hours: 0, minutes: 45 } },
                    { title: "Simulación práctica", duration: { hours: 0, minutes: 40 } }
                ]
            },
            {
                sectionTitle: "Legislación y buenas prácticas",
                classes: [
                    { title: "Leyes y regulaciones", duration: { hours: 0, minutes: 25 } },
                    { title: "Almacenamiento y transporte seguro", duration: { hours: 0, minutes: 20 } }
                ]
            }
        ],
        rating: 4.2,
        reviews: 45,
        userReviews: [
            { name: "Raúl Fernández", rating: 5, comment: "Muy útil para aprender a usar sprays de forma segura." },
            { name: "Sofía Martínez", rating: 4, comment: "El curso es claro, pero algunos apartados son cortos." },
            { name: "Miguel Sánchez", rating: 4, comment: "" },
            { name: "Lucía Gómez", rating: 3, comment: "Faltan más ejemplos prácticos." },
            { name: "Paco Martínez", rating: 5, comment: "Muy buen curso." }
        ]
    },
    {
        id: "defensa-femenina",
        title: "Defensa Personal Femenina: Seguridad y Confianza",
        description: "Aprende técnicas de defensa personal adaptadas para mujeres en diferentes situaciones",
        longDescription: `Este curso está diseñado específicamente para mujeres que desean aprender a protegerse en situaciones cotidianas y de riesgo. 
A través de técnicas prácticas de Krav Maga y estrategias de autoprotección, mejorarás tu confianza y seguridad personal.`,
        image: "/assets/defensa-personal-femenina.jpg",
        price: "54,99",
        topics: ["Técnicas de defensa", "Krav Maga", "Autoprotección", "Simulaciones"],
        updated_at: "2024-08-10",
        created_at: "2024-08-01",
        isSubtitled: true,
        language: "Español",
        includes: [
            "8 horas de video a tu ritmo",
            "Acceso de por vida al contenido",
            "Ejercicios prácticos paso a paso",
            "Material descargable en PDF",
            "Certificado de finalización",
            "Consejos para aumentar tu seguridad diaria"
        ],
        requirements: [
            "Ropa cómoda para entrenar",
            "Espacio libre para moverse",
            "Disposición para practicar técnicas de defensa personal"
        ],
        whatYouWillLearn: [
            "Cómo reaccionar ante ataques comunes",
            "Técnicas básicas y avanzadas de Krav Maga adaptadas",
            "Autoprotección en la vida diaria",
            "Desarrollar confianza y control corporal",
            "Simulaciones de escenarios reales"
        ],
        content: [
            {
                sectionTitle: "Fundamentos",
                classes: [
                    { title: "Introducción a la defensa femenina", duration: { hours: 0, minutes: 30 } },
                    { title: "Postura y movimiento básico", duration: { hours: 0, minutes: 45 } },
                    { title: "Golpes y bloqueos básicos", duration: { hours: 1, minutes: 0 } }
                ]
            },
            {
                sectionTitle: "Técnicas de defensa",
                classes: [
                    { title: "Defensa contra agarres", duration: { hours: 1, minutes: 15 } },
                    { title: "Defensa contra ataques con puños", duration: { hours: 1, minutes: 30 } },
                    { title: "Defensa contra ataques con objetos", duration: { hours: 1, minutes: 0 } }
                ]
            },
            {
                sectionTitle: "Simulaciones y práctica",
                classes: [
                    { title: "Situaciones cotidianas", duration: { hours: 1, minutes: 0 } },
                    { title: "Escenarios públicos y transporte", duration: { hours: 0, minutes: 50 } }
                ]
            }
        ],
        rating: 4.7,
        reviews: 98,
        userReviews: [
            { name: "Laura Gómez", rating: 5, comment: "Muy completo y adaptado para mujeres. Me siento más segura." },
            { name: "Isabel Martínez", rating: 4, comment: "Explicaciones claras y ejercicios prácticos." },
            { name: "Sofía Ruiz", rating: 5, comment: "Excelente curso, lo recomiendo totalmente." }
        ]
    },
    {
        id: "krav-maga-avanzado",
        title: "Krav Maga Avanzado: Técnicas de Defensa Real",
        description: "Curso avanzado de Krav Maga para situaciones de alto riesgo",
        longDescription: `Este curso está orientado a personas que ya tienen conocimientos básicos de Krav Maga y quieren profundizar en técnicas avanzadas de defensa personal. 
Aprenderás estrategias para enfrentar ataques complejos y situaciones peligrosas con seguridad y eficacia.`,
        image: "/assets/foto-curso-krav-maga-avanzado.png",
        price: "64,99",
        topics: ["Krav Maga avanzado", "Defensa personal", "Tácticas de seguridad"],
        updated_at: "2024-09-05",
        created_at: "2024-09-01",
        isSubtitled: true,
        language: "Español",
        includes: [
            "12 horas de video a tu ritmo",
            "Acceso de por vida al contenido",
            "Ejercicios avanzados paso a paso",
            "Material descargable en PDF",
            "Certificado de finalización",
            "Consejos tácticos para situaciones reales"
        ],
        requirements: [
            "Conocimientos básicos de Krav Maga",
            "Ropa cómoda para entrenar",
            "Espacio libre para practicar técnicas avanzadas"
        ],
        whatYouWillLearn: [
            "Técnicas avanzadas de Krav Maga",
            "Defensa contra múltiples atacantes",
            "Uso de objetos como defensa",
            "Simulaciones de ataques complejos",
            "Mejorar velocidad y reacción bajo presión"
        ],
        content: [
            {
                sectionTitle: "Técnicas avanzadas",
                classes: [
                    { title: "Ataques combinados y defensa", duration: { hours: 1, minutes: 0 } },
                    { title: "Defensa en el suelo", duration: { hours: 1, minutes: 30 } },
                    { title: "Defensa contra armas", duration: { hours: 1, minutes: 15 } }
                ]
            },
            {
                sectionTitle: "Simulaciones",
                classes: [
                    { title: "Ataques múltiples", duration: { hours: 1, minutes: 0 } },
                    { title: "Escenarios reales", duration: { hours: 1, minutes: 0 } }
                ]
            }
        ],
        rating: 4.8,
        reviews: 65,
        userReviews: [
            { name: "David López", rating: 5, comment: "Curso muy completo para avanzar en Krav Maga." },
            { name: "Carla Fernández", rating: 4, comment: "Técnicas claras y útiles." },
            { name: "Javier Morales", rating: 5, comment: "Simulaciones muy realistas y prácticas." }
        ]
    }

];
