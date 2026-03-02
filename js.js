
        document.addEventListener('DOMContentLoaded', () => {
            
            // --- 1. Animación de Scroll ---
            const reveals = document.querySelectorAll('.reveal');
            const revealOnScroll = () => {
                const windowHeight = window.innerHeight;
                const elementVisible = window.innerWidth < 768 ? 50 : 100;

                reveals.forEach(reveal => {
                    const elementTop = reveal.getBoundingClientRect().top;
                    if (elementTop < windowHeight - elementVisible) {
                        reveal.classList.add('active');
                    }
                });
            };
            window.addEventListener('scroll', revealOnScroll);
            window.addEventListener('resize', revealOnScroll);
            revealOnScroll();

            // --- 2. Animación de la Caja y el Gato en Navbar ---
            const catTab = document.getElementById('schrodinger-cat-tab');
            const catAlive = document.getElementById('cat-alive');
            const catDead = document.getElementById('cat-dead');
            const catStatusText = document.getElementById('cat-status-text');
            const boxButton = document.getElementById('box-button');
            
            let isAnimating = false;

            if(boxButton) {
                boxButton.addEventListener('click', () => {
                    if (isAnimating) return;
                    isAnimating = true;

                    // Probabilidad cuántica (50%)
                    const isCatDead = Math.random() < 0.5;

                    if (isCatDead) {
                        catAlive.classList.add('hidden');
                        catDead.classList.remove('hidden');
                        catStatusText.innerText = "Muerto";
                        catStatusText.classList.replace('text-zinc-300', 'text-zinc-600');
                    } else {
                        catDead.classList.add('hidden');
                        catAlive.classList.remove('hidden');
                        catStatusText.innerText = "Vivo";
                        catStatusText.classList.replace('text-zinc-600', 'text-zinc-300');
                    }

                    boxButton.classList.add('-translate-y-1', 'scale-110', 'text-zinc-200');

                    // Deslizar la etiqueta del gato hacia abajo
                    catTab.classList.remove('-translate-y-full');
                    catTab.classList.add('translate-y-0');

                    // Regresarlo arriba después de 3 seg
                    setTimeout(() => {
                        catTab.classList.remove('translate-y-0');
                        catTab.classList.add('-translate-y-full');
                        boxButton.classList.remove('-translate-y-1', 'scale-110', 'text-zinc-200');
                        
                        setTimeout(() => { isAnimating = false; }, 700);
                    }, 3000);
                });
            }

            // --- 3. Animación de la Imagen Principal del Gato (Click) ---
            const mainCatImage = document.getElementById('main-cat-image');
            const mainCatText = document.getElementById('main-cat-text');
            
            if(mainCatImage) {
                mainCatImage.addEventListener('click', () => {
                    mainCatImage.classList.toggle('revealed');
                    
                    if (mainCatImage.classList.contains('revealed')) {
                        mainCatText.innerText = 'Realidad revelada';
                        mainCatText.classList.replace('text-zinc-600', 'text-zinc-300');
                    } else {
                        mainCatText.innerText = 'Toca la imagen para revelar la realidad';
                        mainCatText.classList.replace('text-zinc-300', 'text-zinc-600');
                    }
                });
            }

            // --- 4. Integración de API LLM (Gemini) ---
            const apiKey = ""; // La API Key es proporcionada en el entorno automáticamente
            const catChatBtn = document.getElementById('cat-chat-btn');
            const catChatInput = document.getElementById('cat-chat-input');
            const catChatResponse = document.getElementById('cat-chat-response');

            // Función con Exponential Backoff para manejar posibles reintentos de conexión
            async function fetchWithRetry(url, options, maxRetries = 5) {
                let retries = 0;
                const delays = [1000, 2000, 4000, 8000, 16000];
                
                while (retries < maxRetries) {
                    try {
                        const response = await fetch(url, options);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        return await response.json();
                    } catch (error) {
                        if (retries === maxRetries - 1) throw error;
                        await new Promise(resolve => setTimeout(resolve, delays[retries]));
                        retries++;
                    }
                }
            }

            if(catChatBtn) {
                catChatBtn.addEventListener('click', async () => {
                    const question = catChatInput.value.trim();
                    if (!question) return;

                    // Mostrar estado de carga (UI)
                    catChatResponse.classList.remove('hidden');
                    catChatResponse.innerHTML = '<span class="quantum-pulse">Procesando la superposición cuántica para responder...</span>';
                    catChatBtn.disabled = true;
                    catChatBtn.classList.add('opacity-50', 'cursor-not-allowed');

                    // Promt del sistema inyectando la personalidad
                    const systemPrompt = "Eres el famoso Gato del experimento de Schrödinger. Estás vivo y muerto al mismo tiempo. Eres sarcástico, filosófico y te burlas ligeramente de las mentes mortales que no entienden la mecánica cuántica. Responde la pregunta del usuario en máximo dos párrafos cortos de manera muy misteriosa.";

                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
                    const payload = {
                        contents: [{ parts: [{ text: question }] }],
                        systemInstruction: { parts: [{ text: systemPrompt }] }
                    };
                    const options = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    };

                    try {
                        // Llamada a la API de Gemini
                        const result = await fetchWithRetry(url, options);
                        const aiTextResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
                        
                        catChatResponse.innerText = `🐾 "${aiTextResponse || 'Miauu... una fluctuación cuántica bloqueó mi respuesta.'}"`;
                    } catch (error) {
                        catChatResponse.innerText = "Error: El veneno se liberó y cortó la conexión antes de responder. Intenta nuevamente.";
                    } finally {
                        catChatBtn.disabled = false;
                        catChatBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                });

                // Permitir enviar con la tecla Enter
                catChatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') catChatBtn.click();
                });
            }
        });
     