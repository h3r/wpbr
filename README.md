# WPBR: Iluminación Fotorrealista PBR en la web con WebGL

![image](http://i.imgur.com/9bxNCWx.jpg)

Physically Based Rendering (PBR) es una técnica avanzada de iluminación foto-realista  que tiene como fin la simulación más precisa sobre el comportamiento de la luz, en contraposición con técnicas como Blinn o  Phong shading, cuando esta interactúa con los diferentes materiales de una escena. 

Existen técnicas como “image based lighting”(IBL) o diferentes modelos del BRDF que permiten aproximar el resultado final a un coste menor, contraponiendo un cierto nivel de precisión en los resultados y pudiendo así llevar a cabo este algoritmo a velocidades de renderizado interactivas. 

La ubicuidad de la web, la evolución del motor de JavaScript en los navegadores y la existencia de APIs como WebGL para comunicarnos directamente con la GPU nos permite portar y crear aplicaciones 3D en contexto del navegador. El uso de los programas Shader permiten delegar una importante carga del algoritmo en la GPU. 

El objetivo de este proyecto es portar un render que implemente la técnica de PBR al entorno web mediante el uso de JavaScript y la API WebGL, haciendo uso de diferentes métodos de optimización además de los ya mencionados. 

---

[**Slides**](https://drive.google.com/file/d/0B_wn5NANTpbzMndpYjFzeWJNQzg/view?usp=sharing) | [**Notes**](https://drive.google.com/file/d/0BwcYGG6SdjyMZkJDYW1sSjBjdDQ/view?usp=sharing) | [**Video**](http://www.youtube.com/watch?v=K-WRY8MKHvk) | [**Demo**](http://h3r.github.io/wpbr/) 


