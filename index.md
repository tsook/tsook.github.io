---
layout: default
description: |
    I am a second year PhD student in the [School of Computing](https://cs.kaist.ac.kr/){:target="_blank"} at [KAIST](https://www.kaist.ac.kr/){:target="_blank"}. I work with [Juho Kim](https://juhokim.com/){:target="_blank"} as a member of [KIXLAB](https://www.kixlab.org/){:target="_blank"}.

    My work falls in the intersection of human-computer interaction (<b>HCI</b>) and artificial intelligence (<b>AI</b>). I design tools that enable users to <b>design</b>, <b>develop</b>, and <b>test</b> novel <b>applications powered by machine learning models</b>. Recently, I have been interested in investigating how to embed human and personal <b>values</b> into ML models.
---

## Publications

#### Conference Papers

<div>
{% for paper in site.data.papers %}
    <div class="paper-cont">
        <div class="paper-img-cont" style="background-image:url({{paper.img | relative_url}})"></div>
        <div style="flex:1">
            <div class="paper-line"><a href="{{paper.url}}" target="_blank">{{paper.title}}</a></div>
            <div class="paper-line">
                {% for author in paper.authors %}
                    {% if author.name == "Tae Soo Kim" %}
                        <strong>{{author.name}}</strong>{% if forloop.last != true %}, {% endif %}
                    {% else %}
                        {% if author.url %}
                            <a href="{{author.url}}" target="_blank">{{author.name}}</a>{% if forloop.last != true %}, {% endif %}
                        {% else %}
                            {{author.name}}{% if forloop.last != true %}, {% endif %}
                        {% endif %}
                    {% endif %}
                {% endfor %}
            </div>
            <div class="paper-line">
                <span class="paper-deets">{{paper.conference}} {% if paper.toappear %}(to appear) {% endif %}</span>
                {% if paper.website %}
                    <span class="paper-deets">
                        <a href="{{paper.website}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>
                            <span>Website</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.demo %}
                    <span class="paper-deets">
                        <a href="{{paper.demo}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>
                            <span>Demo</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.video %}
                    <span class="paper-deets">
                        <a href="{{paper.video}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
                            <span>Video</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.acmdl %}
                    <span class="paper-deets">
                        <a href="{{paper.acmdl}}" target="_blank">
                            <i class="ai ai-acmdl"></i>
                            ACM DL
                        </a>
                    </span>
                {% endif %}
                {% if paper.arxiv %}
                    <span class="paper-deets">
                        <a href="{{paper.arxiv}}" target="_blank">
                            <i class="ai ai-arxiv"></i>
                            arXiv
                        </a>
                    </span>
                {% endif %}
            </div>
            {% if paper.award %}
            <div class="paper-line">
                <span class="award"><i class="fa-solid fa-medal" style="margin-right: 4px"></i>{{paper.award}}</span>
            </div>
            {% endif %}
        </div>
    </div>
{% endfor %}
</div>

#### Preprints

<div>
{% for paper in site.data.preprints %}
    <div class="paper-cont">
        <div class="paper-img-cont" style="background-image:url({{paper.img | relative_url}})"></div>
        <div style="flex:1">
            <div class="paper-line"><a href="{{paper.url}}" target="_blank">{{paper.title}}</a></div>
            <div class="paper-line">
                {% for author in paper.authors %}
                    {% if author.name == "Tae Soo Kim" %}
                        <strong>{{author.name}}</strong>{% if forloop.last != true %}, {% endif %}
                    {% else %}
                        {% if author.url %}
                            <a href="{{author.url}}" target="_blank">{{author.name}}</a>{% if forloop.last != true %}, {% endif %}
                        {% else %}
                            {{author.name}}{% if forloop.last != true %}, {% endif %}
                        {% endif %}
                    {% endif %}
                {% endfor %}
            </div>
            <div class="paper-line">
                <span class="paper-deets">{{paper.conference}} {% if paper.toappear %}(to appear) {% endif %}</span>
                {% if paper.website %}
                    <span class="paper-deets">
                        <a href="{{paper.website}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>
                            <span>Website</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.demo %}
                    <span class="paper-deets">
                        <a href="{{paper.demo}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>
                            <span>Demo</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.video %}
                    <span class="paper-deets">
                        <a href="{{paper.video}}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
                            <span>Video</span>
                        </a>
                    </span>
                {% endif %}
                {% if paper.acmdl %}
                    <span class="paper-deets">
                        <a href="{{paper.acmdl}}" target="_blank">
                            <i class="ai ai-acmdl"></i>
                            ACM DL
                        </a>
                    </span>
                {% endif %}
                {% if paper.arxiv %}
                    <span class="paper-deets">
                        <a href="{{paper.arxiv}}" target="_blank">
                            <i class="ai ai-arxiv"></i>
                            arXiv
                        </a>
                    </span>
                {% endif %}
            </div>
            {% if paper.award %}
            <div class="paper-line">
                <span class="award"><i class="fa-solid fa-medal" style="margin-right: 4px"></i>{{paper.award}}</span>
            </div>
            {% endif %}
        </div>
    </div>
{% endfor %}
</div>

#### Posters, Demos, Workshop Papers

<div>
{% for paper in site.data.posters %}
    <div class="poster-cont">
        <div class="paper-line"><a href="{{paper.url}}" target="_blank">{{paper.title}}</a></div>
        <div class="paper-line">
            {% for author in paper.authors %}
                {% if author.name == "Tae Soo Kim" %}
                    <strong>{{author.name}}</strong>{% if forloop.last != true %}, {% endif %}
                {% else %}
                    {% if author.url %}
                        <a href="{{author.url}}" target="_blank">{{author.name}}</a>{% if forloop.last != true %}, {% endif %}
                    {% else %}
                        {{author.name}}{% if forloop.last != true %}, {% endif %}
                    {% endif %}
                {% endif %}
            {% endfor %}
        </div>
        <div class="paper-line">
            <span class="paper-deets">{{paper.conference}} {% if paper.toappear %}(to appear) {% endif %}</span>
            {% if paper.website %}<span class="paper-deets"><a href="{{paper.website}}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i>Website</a></span>{% endif %}
            {% if paper.video %}<span class="paper-deets"><a href="{{paper.video}}" target="_blank"><i class="fa-brands fa-youtube"></i>Video</a></span>{% endif %}
            {% if paper.acmdl %}<span class="paper-deets"><a href="{{paper.acmdl}}" target="_blank"><i class="ai ai-acmdl"></i>ACM DL</a></span>{% endif %}
        </div>
        {% if paper.award %}
        <div class="paper-line">
            <span class="award"><i class="fa-solid fa-medal" style="margin-right: 4px"></i>{{paper.award}}</span>
        </div>
        {% endif %}
    </div>
{% endfor %}
</div>
